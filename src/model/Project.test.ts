import util from 'util';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';

import Project from './Project';
import DowError from './DowError';

import { PROJECT_CONFIG_FILE, DEFAULT_DOW_JSON } from '../constants/defaults'
import { fstat } from 'node:fs';

const exec = util.promisify(child_process.exec);

/*
  Create and remove a local .tmp directory
  to which the process working directory is
  changed.
*/
let tmpDirectory : string;
let cwd : string;

beforeAll(async () => {
  const now = new Date();
  const pad = (v : number) => `${v}`.padStart(2, '0');
  const dateHash = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  cwd = process.cwd();
  tmpDirectory = path.resolve('.', '.teststmp', `${dateHash}`);

  await exec(`mkdir -p ${tmpDirectory}`);
  process.chdir(tmpDirectory);
})

afterAll(async () => {
  process.chdir(cwd);

  /*
    Should we clear the tmp directories after the test suite is done?
  */
  if(process.env.CLEANUP_ON_EXIT !== 'false') {
    await exec(`rm -rf ${tmpDirectory}`);
  }
});


/*
  Keep track of test index to create separate temporary directories
*/
let lastTestId = 0;

/********************************************/
/********************************************/
describe('Project initialization', () => {
  /*
    Create local temporary directories
  */
  let localTmpDirectory : string;
  let localCwd : string;

  beforeEach(async () => {
    localCwd = process.cwd();
    localTmpDirectory = path.resolve('.', `.tmp-${++lastTestId}`);

    await exec(`mkdir ${localTmpDirectory}`);
    process.chdir(localTmpDirectory);
  })

  afterEach(async () => {
    process.chdir(localCwd);
  });


  /********************************************/
  /********************************************/
  test('Find project when we are in root directory', async () => {
    await exec(`touch ${PROJECT_CONFIG_FILE}`);

    const project = new Project();

    expect(project.isValid).toBe(true);
  });

  test('Find project when we are in subdirectories', async () => {
    await exec(`touch ${PROJECT_CONFIG_FILE}`);
    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();

    expect(process.cwd().includes('path/to/subdirectory')).toBe(true);
    expect(project.isValid).toBe(true);
  })

  test('Initialize project', async () => {
    const project = new Project();
    project.init();

    const defaultConfigString : string = fs.readFileSync(`./${PROJECT_CONFIG_FILE}`).toString();
    const defaultConfig = JSON.parse(defaultConfigString);

    expect(defaultConfig).toBeDefined();
    expect(defaultConfig).toEqual(DEFAULT_DOW_JSON);
  });

  test('Avoid initializing project inside a project', async () => {
    await exec(`touch ${PROJECT_CONFIG_FILE}`);
    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();

    expect(() => {project.init()}).toThrow(DowError)
  })

  test('Assert should throw if we are not in a project folder', async () => {
    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();
    expect(() => {project.assert()}).toThrow(DowError)
  })

  test('Assert should not throw if we are not in a project folder', async () => {
    await exec(`touch ${PROJECT_CONFIG_FILE}`);
    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();
    expect(() => {project.assert()}).not.toThrow()
  })
})
