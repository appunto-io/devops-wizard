import fs from 'fs';
import path from 'path';

import Catalog from './Catalog';
import DowError from './DowError';
import Project from './Project';
import exec from '../tools/exec';

import { TEMPLATES_FILE } from '../constants/defaults';

import TestHelper from './TestHelper';
const testHelper = new TestHelper('Catalog', process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

const TEST_CATALOG = {
  "templates" : [
    {
      "name" : "template1",
      "description" : "description1",
      "repository" : "repository1"
    },
    {
      "name" : "template2",
      "description" : "description2",
      "repository" : "repository2"
    },
    {
      "name" : "template3",
      "description" : "description3",
      "repository" : "repository3"
    }
  ]
}


/********************************************/
/********************************************/
describe('Catalog', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('Initialization of empty catalog', async () => {
    const project = new Project();
    const catalog = new Catalog(project);

    expect(catalog.templates).toEqual([]);
  });

  test('Fail loading if there is no project', () => {
    const project = new Project();
    const catalog = new Catalog(project);

    expect(catalog.load()).rejects.toBeInstanceOf(DowError);
  })

  test('Load catalog', async () => {
    const catalogdir  = path.resolve('.', 'testcatalog');
    const catalogfile = path.resolve(catalogdir, TEMPLATES_FILE);
    const projectdir  = path.resolve('.', 'testproject');

    await exec('mkdir testcatalog');
    await exec('mkdir testproject');

    process.chdir(catalogdir);
    await exec('git init');
    fs.writeFileSync(path.resolve(catalogfile), JSON.stringify(TEST_CATALOG, null, 2));
    await exec('git add -A');
    await exec('git commit -m "catalog"');


    process.chdir(projectdir);

    const project = new Project();
    project.init();
    const config = project.getConfig();

    config.values.templatesCatalog = catalogdir;
    config.save();

    const catalog = new Catalog(project);
    await catalog.load();

    expect(catalog.templates.length).toEqual(TEST_CATALOG.templates.length)
    expect(catalog.templates[0].name).toEqual(TEST_CATALOG.templates[0].name)
    expect(catalog.templates[1].name).toEqual(TEST_CATALOG.templates[1].name)
    expect(catalog.templates[2].name).toEqual(TEST_CATALOG.templates[2].name)
  })
})
