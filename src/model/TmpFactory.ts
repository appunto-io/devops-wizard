import runScript from '../tools/run-script';
import Project from './Project';

/**
 * Handle template directories creation and cleanup
 */
export default class TmpFactory {
  private directories : string[] = [];
  private project : Project;

  constructor (project : Project) {
    this.project = project;
  }

  /**
   * Creates a temporary directory
   *
   * @returns {Promise<string>} the absolute path to the new temporary directory
   */
  async get () {
    this.project.assert();

    const name = `.tmp${Math.round(Math.random()*100000)}`;

    await runScript(`mkdir ${name}`, false, {cwd : this.project.root});

    this.directories.push(name);

    return `${this.project.root}/${name}`;
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
        name => runScript(`rm -rf ${name}`, false, {cwd : this.project.root})
      )
    )
  }
};

