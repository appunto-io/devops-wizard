import runScript from '../tools/run-script';
import { Global } from '../constants/types';
declare const global : Global;

/**
 * Handle template directories creation and cleanup
 */
export default class TmpFactory {
  private directories : string[] = [];

  /**
   * Creates a temporary directory
   *
   * @returns {Promise<string>} the absolute path to the new temporary directory
   */
  async get () {
    global.project.assert();

    const name = `.tmp${Math.round(Math.random()*100000)}`;

    await runScript(`mkdir ${name}`, false, {cwd : global.project.root});

    this.directories.push(name);

    return `${global.project.root}/${name}`;
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
        name => runScript(`rm -rf ${name}`, false, {cwd : global.project.root})
      )
    )
  }
};

