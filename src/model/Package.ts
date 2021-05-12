import tmp from 'tmp';
import fs from 'fs';
import path from 'path';
import runScriptSync from '../tools/run-script-sync';
import DowError from './DowError';
import Project from './Project';

import { PACKAGES_DIRECTORY, DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';

class Package {
  readonly project : Project;
  readonly name : string;
  readonly remote : string;

  /**
   * Creates a package
   * 
   * @param {Project} project The root project
   * @param {string} name Name of the package
   * @param {string} remote URL of the package repository
   */
  constructor(project : Project, name : string, remote : string) {
    this.project = project;
    this.name = name;
    this.remote = remote;
  }

  /**
   * Creates the package by using git submodules
   * 
   * @param {string} [templateRepository] The remote template repository
   */
  init (templateRepository ?: string) {
    if(!this.project.isValid) {
      throw new DowError('You should create a project first.');
    }

    const packagePath = path.resolve(this.project.root, PACKAGES_DIRECTORY, this.name);
    if(fs.existsSync(packagePath)) {
      throw new DowError(`Package ${this.name} already exists`);
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
        git submodule add ${this.remote} ${PACKAGES_DIRECTORY}/${this.name}
        git add ${PACKAGES_DIRECTORY}/${this.name}
        git add .gitmodules
      `, false, {cwd : this.project.root, stdio : 'ignore'})
    }
    catch(error) {
      throw new DowError(`ERROR: unable to add remote package ${this.remote}`);
    }

    /*
      Apply template
    */
    if(templateRepository) {
      const gitBackup : string = tmp.dirSync().name;

      runScriptSync(`
        mv ${PACKAGES_DIRECTORY}/${this.name}/.git ${gitBackup}/
        rm -rf ${PACKAGES_DIRECTORY}/${this.name}/**
        rm -rf ${templateDirectory}/.git
        cp -rf ${templateDirectory}/** ${PACKAGES_DIRECTORY}/${this.name}/
        cp  ${gitBackup}/.git ${PACKAGES_DIRECTORY}/${this.name}/
      `, false, {cwd : this.project.root, stdio : 'ignore'})
    }

    /*
      Create default package config if necessary
    */
    const packageConfigFile = path.resolve(this.project.root, PACKAGES_DIRECTORY, this.name, PACKAGE_CONFIG_FILE)
    if (!fs.existsSync(packageConfigFile)) {
      fs.writeFileSync(packageConfigFile, JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2));

      runScriptSync(`
        git add ${PACKAGE_CONFIG_FILE}
      `, false, {
        cwd : path.resolve(this.project.root, PACKAGES_DIRECTORY, this.name)
      })
    }
  }
}

export default Package;