import path from 'path';
import exec from '../tools/exec';
import tmp from 'tmp';


export default class TestHelper {
  name : string;

  tmpDirectory  : string;
  cwd           : string;
  dateHash      : string;
  cleanupOnExit : boolean;

  lastTestId        : number;
  localCwd          : string;
  localTmpDirectory : string;

  constructor(name : string, cleanupOnExit = true) {
    this.name = name;
    this.cwd = process.cwd();
    this.dateHash = this.createDateHash();
    this.cleanupOnExit = cleanupOnExit;
    this.lastTestId = 0;
  }

  private createDateHash() {
    const now = new Date();
    const pad = (v : number) => `${v}`.padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  }

  async beforeAll () {
    this.tmpDirectory = path.resolve('.', '.teststmp', `${this.dateHash}-${this.name}`);

    await exec(`mkdir -p ${this.tmpDirectory}`);
    process.chdir(this.tmpDirectory);
    // Create a git repository to avoid polluting source code repo
    await exec(`git init`);
  }

  async afterAll() {
    process.chdir(this.cwd);

    /*
      Should we clear the tmp directories after the test suite is done?
    */
    if(this.cleanupOnExit) {
      await exec(`rm -rf ${this.tmpDirectory}`);
    }
  }

  async beforeEach() {
    this.localCwd = process.cwd();
    this.localTmpDirectory = path.resolve('.', `.tmp-${++this.lastTestId}`);

    await exec(`mkdir ${this.localTmpDirectory}`);
    process.chdir(this.localTmpDirectory);
  }

  async afterEach() {
    process.chdir(this.localCwd);
  }
}