import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import ProjectConfig from './ProjectConfig';
import DowError from './DowError';

import { PROJECT_CONFIG_FILE } from '../constants/defaults';

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
}

export default Project;