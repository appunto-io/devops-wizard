import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import Package from './Package';
import Project from './Project';
import DowError from './DowError';

import { DEFAULT_PACKAGE_JSON, PACKAGES_DIRECTORY, PACKAGE_CONFIG_FILE } from '../constants/defaults';

import TestHelper from './TestHelper';
const testHelper = new TestHelper('Package', process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('Packages', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('Package creation', async () => {
    const pkg = new Package('root');

    expect(pkg.root).toBe('root');
  });

  test('Fail initialization on already initialized packages', () => {
    const pkg = new Package('.');
    execSync(`touch ${PACKAGE_CONFIG_FILE}`);

    expect(() => pkg.init()).toThrow(DowError);
  })

  test('Initialize package', () => {
    const pkg = new Package('.');
    pkg.init({remote : 'repo'});

    expect(fs.existsSync(PACKAGE_CONFIG_FILE)).toBe(true);
    expect(require(path.resolve('.', PACKAGE_CONFIG_FILE)).remote).toBe('repo');
  })

  test('Get package configuration', () => {
    fs.writeFileSync(PACKAGE_CONFIG_FILE, JSON.stringify({...DEFAULT_PACKAGE_JSON, remote : 'repo'}));

    const pkg = new Package('.');
    const config = pkg.getConfig();

    expect(config.values.remote).toBe('repo');
  })
})
