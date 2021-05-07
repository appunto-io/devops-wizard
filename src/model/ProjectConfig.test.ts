import fs from 'fs';
import path from 'path';
import Project from './Project';
import ProjectConfig from './ProjectConfig';

import exec from '../tools/exec';

import { DEFAULT_DOW_JSON, PROJECT_CONFIG_FILE} from '../constants/defaults';

import TestHelper from './TestHelper';
const testHelper = new TestHelper('ProjectConfig', process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('Config initialization', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('Default config for invalid projects', async () => {
    const project = new Project();
    const config = new ProjectConfig(project);

    expect(config.values).toEqual(DEFAULT_DOW_JSON);
  });

  test('Load stored config', async () => {
    const newConfig = {...DEFAULT_DOW_JSON, dowJsonVersion : 'modified'};
    fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();
    const config = new ProjectConfig(project);

    expect(config.values).toEqual(newConfig);
  });

  test('Store values', async () => {
    new Project().init();

    await exec(`mkdir -p path/to/subdirectory`);
    process.chdir(path.resolve('.', 'path/to/subdirectory'));

    const project = new Project();
    const config = new ProjectConfig(project);
    config.values.dowJsonVersion = 'modified';
    config.save();

    const readerConfig = new ProjectConfig(project);

    expect(readerConfig.values.dowJsonVersion).toEqual('modified');
  })
})
