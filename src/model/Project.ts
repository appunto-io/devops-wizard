import path from 'path';
import fs from 'fs';

import ProjectConfig from './ProjectConfig';
import TmpFactory from './TmpFactory';
import DowError from './DowError';

import { PROJECT_CONFIG_FILE } from '../constants/defaults';

class Project {
  isValid : boolean;
  root : string | null;
  tmp : TmpFactory;

  constructor () {
    this.root = this.findRoot();
    this.isValid = !!this.root;
    this.tmp = new TmpFactory(this);
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
   * Creates a temporary directory
   * @returns {Promise<string>} the absolute path of the create tmp directory
   */
  async getTmp() {
    return this.tmp.get();
  }

  /**
   * Cleanup temporary directories
   */
  async cleanupTmp() {
    return this.tmp.cleanup();
  }
}

export default Project;