import fs from 'fs';
import path from 'path';
import runScriptSync from '../tools/run-script-sync';

import { PACKAGES_DIRECTORY, DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';
import DowError from './DowError';

class Package {
  readonly root : string;
  readonly remote : string;

  /**
   * Creates a package
   *
   * @param {string} root Package path
   * @param {string} remote URL of the package repository
   */
  constructor(root : string, remote : string) {
    this.root = root;
    this.remote = remote;
  }

  /**
   * Creates the package config file
   */
  init () {
    /*
      Create default package config if necessary
    */
    const packageConfigFile = path.resolve(this.root, PACKAGE_CONFIG_FILE)
    if (fs.existsSync(packageConfigFile)) {
      throw new DowError('Packages is already initialized');
    }

    fs.writeFileSync(packageConfigFile, JSON.stringify({...DEFAULT_PACKAGE_JSON, remote : this.remote}, null, 2));

    runScriptSync(`
      git add ${PACKAGE_CONFIG_FILE}
    `, false, {
      cwd : this.root
    })
  }
}

export default Package;