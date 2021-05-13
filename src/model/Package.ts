import fs from 'fs';
import path from 'path';
import runScriptSync from '../tools/run-script-sync';

import DowError from './DowError';
import PackageConfig, { PackageConfigValues } from './PackageConfig';

import { DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';

class Package {
  readonly root : string;

  private config : PackageConfig;

  /**
   * Creates a package
   *
   * @param {string} root Package path
   * @param {string} remote URL of the package repository
   */
  constructor(root : string) {
    this.root = root;
  }

  /**
   * Creates the package config file
   */
  init (values ?: Partial<PackageConfigValues>) {
    /*
      Create default package config if necessary
    */
    const packageConfigFile = path.resolve(this.root, PACKAGE_CONFIG_FILE)
    if (fs.existsSync(packageConfigFile)) {
      throw new DowError('Packages is already initialized');
    }

    fs.writeFileSync(packageConfigFile, JSON.stringify({...DEFAULT_PACKAGE_JSON, ...values}, null, 2));

    runScriptSync(`
      git add ${PACKAGE_CONFIG_FILE}
    `, false, {
      cwd : this.root
    })
  }

  /**
   * Retrieves the package config
   *
   * @returns {PackageConfig}
   */
   getConfig() {
    if(!this.config) {
      this.config = new PackageConfig(this);
    }

    return this.config;
  }

}

export default Package;