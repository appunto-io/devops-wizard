import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import Package from './Package';
import PackageConfig from './PackageConfig';

import { DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';

import TestHelper from './TestHelper';
const testHelper = new TestHelper('PackageConfig', process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('PackageConfig', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('Initialize empty config', async () => {
    const pkg = new Package(null);
    const config = new PackageConfig(pkg);

    expect(config.values).toEqual(DEFAULT_PACKAGE_JSON);
  });

  test('Load stored config', async () => {
    const newConfig = {...DEFAULT_PACKAGE_JSON, dowJsonVersion : 'modified'};
    fs.writeFileSync(PACKAGE_CONFIG_FILE, JSON.stringify(newConfig, null, 2));

    const pkg = new Package(path.resolve('.'));
    const config = new PackageConfig(pkg);

    expect(config.values).toEqual(newConfig);
  });

  test('Store values', async () => {
    const pkg = new Package(path.resolve('.'));
    pkg.init();

    execSync(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const config = new PackageConfig(pkg);
    config.values.dowJsonVersion = 'modified';
    config.save();

    const readerConfig = new PackageConfig(pkg);

    expect(readerConfig.values.dowJsonVersion).toEqual('modified');
  })
})
