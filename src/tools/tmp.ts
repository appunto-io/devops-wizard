import runScript from './run-script';
import assertProject from './assert-project';

import { Global } from '../constants/types';
declare const global : Global;

/**
 * Handle template directories creation and cleanup
 */
export default class Tmp {
  private directories : string[] = [];

  /**
   * Creates a temporary directory
   *
   * @returns {Promise<string>} the absolute path to the new temporary directory
   */
  async get () {
    assertProject();

    const name = `.tmp${Math.round(Math.random()*100000)}`;

    await runScript(`mkdir ${name}`, false, {cwd : global.PROJECT_ROOT});

    this.directories.push(name);

    return `${global.PROJECT_ROOT}/${name}`;
  }

  /**
   * Removes all temporary directories
   *
   * @returns {Promise<void>}
   */
  async cleanup () {
    const directories = this.directories;
    this.directories = [];

    return Promise.all(
      directories.map(
        name => runScript(`rm -rf ${name}`, false, {cwd : global.PROJECT_ROOT})
      )
    )
  }
};

export type TmpType = {
  get : () => Promise<string>,
  cleanup : () => Promise<void[]>
};
