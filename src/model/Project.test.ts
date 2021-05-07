import util from 'util';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';

import Project from './Project';
import DowError from './DowError';

import exec from '../tools/exec';

import { PROJECT_CONFIG_FILE, DEFAULT_DOW_JSON } from '../constants/defaults'

import TestHelper from './TestHelper';
const testHelper = new TestHelper(process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('Project initialization', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

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
