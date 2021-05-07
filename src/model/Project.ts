import path from 'path';
import fs from 'fs';

import DowError from './DowError';

import { PROJECT_CONFIG_FILE, DEFAULT_DOW_JSON } from '../constants/defaults';

class Project {
  isValid : boolean;
  root : string | null;

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

    fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(DEFAULT_DOW_JSON, null, 2));
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
}

export default Project;