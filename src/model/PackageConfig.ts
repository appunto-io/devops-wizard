import path from 'path';
import fs from 'fs';

import Package from './Package';
import { DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';
import DowError from './DowError';

class PackageConfig {
  private pkg : Package;
  values : PackageConfigValues

  constructor(pkg : Package) {
    this.pkg = pkg;
    this.values = this.load();
  }

  /**
   * Read config from file
   * @returns {PackageConfigValues} Loaded values
   */
  load () {
    if (!this.pkg.root) {return DEFAULT_PACKAGE_JSON;}

    const configFile = path.resolve(this.pkg.root, PACKAGE_CONFIG_FILE);
    const loadedBuffer = fs.readFileSync(configFile);
    const config = JSON.parse(loadedBuffer.toString());

    return {...DEFAULT_PACKAGE_JSON, ...config};
  }

  /**
   * Store config to file
   */
   save() {
    if (!this.pkg.root) {
      throw new DowError('Package should be initialized before saving configuration.')
    }

    const configFile = path.resolve(this.pkg.root, PACKAGE_CONFIG_FILE);
    fs.writeFileSync(configFile, JSON.stringify(this.values, null, 2));
  }
}

export interface PackageConfigValues {
  dowJsonVersion : string,
  remote         : string,
  vars : {
    [key : string] : string
  },
  outputEnvFile ?: string,
  outputEnvTemplate ?: string,
}

export default PackageConfig;