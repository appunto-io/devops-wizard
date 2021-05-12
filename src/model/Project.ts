import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import { execSync } from 'child_process';

import ProjectConfig from './ProjectConfig';
import Catalog from './Catalog';
import DowError from './DowError';

import runScriptSync from '../tools/run-script-sync';

import { PROJECT_CONFIG_FILE, PACKAGES_DIRECTORY } from '../constants/defaults';
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
        cp -rf ${templateDirectory}/** ${PACKAGES_DIRECTORY}/${name}/
        cp  ${gitBackup}/.git ${PACKAGES_DIRECTORY}/${name}/
      `, false, {cwd : this.root, stdio : 'ignore'})
    }

    const pkg = new Package(path.resolve(this.root, PACKAGES_DIRECTORY, name), repository);
    pkg.init();

    return pkg;
  }

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
}

export default Project;