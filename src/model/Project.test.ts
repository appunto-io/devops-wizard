import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import Package from './Package';
import Project from './Project';
import Catalog from './Catalog';
import DowError from './DowError';

import exec from '../tools/exec';

import { PROJECT_CONFIG_FILE, DEFAULT_DOW_JSON, PACKAGES_DIRECTORY, PACKAGE_CONFIG_FILE } from '../constants/defaults'

import TestHelper from './TestHelper';
const testHelper = new TestHelper('Project', process.env.CLEANUP_ON_EXIT !== 'false');
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

  test('Retrieve catalogs', () => {
    const project = new Project();
    const catalogs = project.getCatalogs();

    expect(catalogs.length).toBe(1);
    expect(catalogs[0]).toBeInstanceOf(Catalog);
  })
})


/********************************************/
/********************************************/
describe('Handling packages', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/

  test('Fail module initialization if there is no project', () => {
    const project = new Project();

    expect(() => project.addPackage('void', 'void')).toThrow(DowError)
  })

  test('Fail on duplicated package', () => {
    const project = new Project();
    project.init();

    execSync(`mkdir -p ${PACKAGES_DIRECTORY}/void`);

    expect(() => project.addPackage('void', 'void')).toThrow(DowError);
  })

  test('Fail when remote is not accessible', () => {
    const project = new Project();
    project.init();

    expect(() => project.addPackage('void', 'void')).toThrow(DowError);
  })


  test('Create package', () => {
    const project = new Project();
    project.init();
    project.addPackage('name', 'https://github.com/appunto-io/dow-templates.git');

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/${PACKAGE_CONFIG_FILE}`)).toBe(true);
  })

  test('Apply template', () => {
    const projectdir  = path.resolve('.', 'testproject');
    const templatedir = path.resolve('.', 'testtemplate');

    execSync('mkdir testproject');
    execSync('mkdir testtemplate');

    process.chdir(templatedir);
    execSync('git init');
    execSync('touch testfile');
    execSync('git add -A');
    execSync('git commit -m "template"');

    process.chdir(projectdir);

    const project = new Project();
    project.init();
    project.addPackage('name', 'https://github.com/appunto-io/dow-templates.git', {templateRepository : templatedir});

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/testfile`)).toBe(true);
  })

  test('Remove package', () => {
    const project = new Project();
    project.init();
    project.addPackage('name', 'https://github.com/appunto-io/dow-templates.git');

    execSync('git init');
    execSync('git add -A', {cwd : path.resolve('.', PACKAGES_DIRECTORY, 'name')});
    execSync('git commit -m "package config file"', {cwd : path.resolve('.', PACKAGES_DIRECTORY, 'name')});
    execSync('git add -A');
    execSync('git commit -m "package"');

    project.removePackage('name');

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(false);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(false);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/${PACKAGE_CONFIG_FILE}`)).toBe(false);
  });

  test('Retrieve package', () => {
    const project = new Project();
    project.init();
    project.addPackage('name', 'https://github.com/appunto-io/dow-templates.git');

    const pkg : Package = project.getPackage('name');

    expect(pkg.getConfig().values.remote).toEqual('https://github.com/appunto-io/dow-templates.git');
  })

  test('Return null if package does not exists', () => {
    const project = new Project();
    project.init();

    const pkg : Package = project.getPackage('name');

    expect(pkg).toBeNull();
  })

  test('Return a list of packages', () => {
    const project = new Project();
    project.init();
    project.addPackage('p1', 'https://github.com/appunto-io/dow-templates.git');
    project.addPackage('p2', 'https://github.com/appunto-io/dow-templates.git');

    const packages = project.getPackages();

    expect(Object.keys(packages)).toHaveLength(2);
    expect(packages.p1).toBeDefined();
    expect(packages.p1).toBeInstanceOf(Package);
    expect(packages.p2).toBeDefined();
    expect(packages.p2).toBeInstanceOf(Package);
  })
});

