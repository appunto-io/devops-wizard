import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import { execSync } from 'child_process';

import ProjectConfig from './ProjectConfig';
import Catalog from './Catalog';
import DowError from './DowError';

import runScriptSync from '../tools/run-script-sync';

import { PROJECT_CONFIG_FILE, PACKAGES_DIRECTORY, PACKAGE_CONFIG_FILE } from '../constants/defaults';
import Package from './Package';

class Project {
  isValid : boolean;
  root : string | null;

  private config : ProjectConfig;

  constructor () {
    this.root = this.findRoot();
    this.isValid = !!this.root;
  }

  /**
   * Initializes a project inside the current working directory
   * by creating the default configuration file.
   *
   * Throws an exception if we are in a project folder.
   */
  init () {
    if(this.isValid) {
      throw new DowError("Trying to initialize a project inside a project");
    }

    fs.writeFileSync(path.resolve('.', PROJECT_CONFIG_FILE), JSON.stringify(new ProjectConfig(this).values, null, 2));
    execSync('git init -q');
    execSync(`git add ${PROJECT_CONFIG_FILE}`);

    this.root = path.resolve('.');
    this.isValid = true;
  }

  /**
   * Finds the pathname of the parent project
   * @returns {string | null} The path of the root project or null
   */
  private findRoot() : string | null {
    const search = (directory ?: string) : string | null => {
      if (!directory) {
        directory = path.resolve('.');
      }

      var file = path.resolve(directory, PROJECT_CONFIG_FILE);

      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return directory;
      }

      var parent = path.resolve(directory, '..');

      if (parent === directory) {
        return null;
      }

      return search(parent);
    }

    return search();
  }

  /**
   * Test if we are in a project folder
   */
   assert() {
    if(!this.isValid) {
      throw new DowError('You need to be in a project folder');
    }
  }

  /**
   * Retrieves the project config
   *
   * @returns {ProjectConfig}
   */
  getConfig() {
    if(!this.config) {
      this.config = new ProjectConfig(this);
    }

    return this.config;
  }

  /**
   * Retrieves the templates catalogs associated with the project
   *
   * @returns {Catalog[]} An array of Catalog objects
   */
  getCatalogs() {
    const config = this.getConfig();

    return config.values.catalogs.map(
      (catalogUrl : string) => new Catalog(catalogUrl)
    )
  }

  /**
   * Create a new package
   * @param {string} name Name of the package
   * @param {string} repository Remote repository
   * @param options can contain templateRepository option
   * @returns {Package} the Package object of the newly create submodule package
   */
  addPackage(name : string, repository : string, options ?: {templateRepository : string}) : Package {
    const templateRepository : string = options?.templateRepository;

    if(!this.isValid) {
      throw new DowError('You should create a project first.');
    }

    const packagePath = path.resolve(this.root, PACKAGES_DIRECTORY, name);
    if(fs.existsSync(packagePath)) {
      throw new DowError(`Package ${name} already exists`);
    }

    /*
      Test if template can be downloaded
    */
    let templateDirectory : string;
    if(templateRepository) {
      templateDirectory = tmp.dirSync().name;

      try {
        runScriptSync(`git clone ${templateRepository} ${templateDirectory}`, false, {stdio : 'ignore'});
      }
      catch(error) {
        throw new DowError(`Unable to download template ${templateRepository}`);
      }
    }


    /*
      Test if remote repository exists
    */
    try {
      runScriptSync(`
        git ls-remote -h "${repository}"
      `, false, {cwd : this.root, stdio : 'ignore'})
    }
    catch(error) {
      throw new DowError(`ERROR: remote repository ${repository} is not reachable`);
    }

    /*
      Handle empty remote repositories
    */
    let remoteIsEmpty : boolean = false;
    try {
      runScriptSync(`
        git ls-remote --exit-code -h "${repository}"
      `, false, {cwd : this.root, stdio : 'ignore'})
    }
    catch(error) {
      // if git ls-remote returns a non zero exit code here, it means that the repo is empty
      remoteIsEmpty = true;
    }

    if(remoteIsEmpty) {
      const remoteCloneDirectory = tmp.dirSync().name;

      try {
        runScriptSync(`
          git clone ${repository} ${remoteCloneDirectory}
        `, false, {cwd : this.root, stdio : 'ignore'});

        runScriptSync(`
          touch .gitignore
          git add -A
          git commit -m "Initial commit"
          git push --set-upstream origin
        `, false, {cwd : remoteCloneDirectory, stdio : 'ignore'});
      }
      catch (error) {
        throw new DowError(`ERROR: unable to create initial commit on empty remote ${repository}`);
      }
    }


    /*
      Create submodule
    */
    try {
      runScriptSync(`
        git submodule add ${repository} ${PACKAGES_DIRECTORY}/${name}
        git add ${PACKAGES_DIRECTORY}/${name}
        git add .gitmodules
      `, false, {cwd : this.root, stdio : 'ignore'})
    }
    catch(error) {
      throw new DowError(`ERROR: unable to add remote package ${repository}`);
    }

    /*
      Apply template
    */
    if(templateRepository) {
      const gitBackup : string = tmp.dirSync().name;

      runScriptSync(`
        mv ${PACKAGES_DIRECTORY}/${name}/.git ${gitBackup}/
        rm -rf ${PACKAGES_DIRECTORY}/${name}/**
        rm -rf ${templateDirectory}/.git
        cp -rf ${templateDirectory}/. ${PACKAGES_DIRECTORY}/${name}/
        cp  ${gitBackup}/.git ${PACKAGES_DIRECTORY}/${name}/
      `, false, {cwd : this.root, stdio : 'ignore'})
    }

    const pkg = new Package(path.resolve(this.root, PACKAGES_DIRECTORY, name));
    pkg.init({remote : repository});

    return pkg;
  }

  /**
   * Remove a package
   * @param {string} name Name of the package to be removed
   */
  removePackage(name : string) {
    const modified : boolean = !!execSync(`git status ${PACKAGES_DIRECTORY}/${name} --porcelain`, {cwd : this.root}).toString();

    if (modified) {
      throw new DowError(`Unable to remove submodule ${name} as there are unsaved modifications. Aborting.`);
    }

    runScriptSync(`
      git rm ${PACKAGES_DIRECTORY}/${name}
      rm -rf .git/modules/${PACKAGES_DIRECTORY}/${name}
    `, false, {cwd : this.root})
  }

  /**
   * Retrieves a package by name
   *
   * @param {string} name Name of the package to retrieve
   * @returns {Package | null} The package or null if not find
   */
  getPackage(name : string) : Package | null {
    const packagePath = path.resolve(this.root, PACKAGES_DIRECTORY, name);
    if(!fs.existsSync(path.resolve(packagePath, PACKAGE_CONFIG_FILE))) {
      return null;
    }

    return new Package(packagePath);
  }

  getPackages() : {[name : string] : Package} {
    const packagesDirs = fs.readdirSync(path.resolve(this.root, PACKAGES_DIRECTORY));

    return packagesDirs
      .reduce(
        (packages, packageDir) => {
          const packagePath = path.resolve(this.root, PACKAGES_DIRECTORY, packageDir);

          if(!fs.existsSync(path.resolve(packagePath, PACKAGE_CONFIG_FILE))) {
            return packages;
          }

          packages[packageDir] = new Package(packagePath);
          return packages;
        },
        {} as {[name : string] : Package}
      )
  }
}

export default Project;