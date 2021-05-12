import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import Package from './Package';
import Project from './Project';
import DowError from './DowError';

import { PACKAGES_DIRECTORY, PACKAGE_CONFIG_FILE } from '../constants/defaults';

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
    const project = new Project();
    const pkg = new Package(project, 'name', 'remote');

    expect(pkg.name).toBe('name');
    expect(pkg.remote).toBe('remote');
  });

  test('Fail module initialization if there is no project', () => {
    const project = new Project();
    const pkg = new Package(project, 'void', 'void');

    expect(() => pkg.init()).toThrow(DowError)
  })

  test('Fail on duplicated package', () => {
    const project = new Project();
    project.init();

    execSync(`mkdir -p ${PACKAGES_DIRECTORY}/void`);
    const pkg = new Package(project, 'void', 'void');

    expect(() => pkg.init()).toThrow(DowError);
  })

  test('Create package', () => {
    const project = new Project();
    project.init();
    const pkg = new Package(project, 'name', 'https://github.com/appunto-io/dow-templates.git');

    pkg.init();

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/${PACKAGE_CONFIG_FILE}`)).toBe(true);
  })

  test('Avoid creating new package json file if one exists', () => {
    const projectdir  = path.resolve('.', 'testproject');
    const packagedir  = path.resolve('.', 'testpackage');
    const packagefile = path.resolve(packagedir, PACKAGE_CONFIG_FILE);

    execSync('mkdir testproject');
    execSync('mkdir testpackage');

    process.chdir(packagedir);
    execSync('git init');
    fs.writeFileSync(path.resolve(packagefile), JSON.stringify({testValue : 'tested'}, null, 2));
    execSync('git add -A');
    execSync('git commit -m "package"');

    process.chdir(projectdir);

    const project = new Project();
    project.init();
    const pkg = new Package(project, 'name', packagedir);

    pkg.init();

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(true);
    expect(require(`${projectdir}/${PACKAGES_DIRECTORY}/name/${PACKAGE_CONFIG_FILE}`).testValue).toBe('tested');
  })

  test('Fail when remote is not accessible', () => {
    const project = new Project();
    project.init();

    const pkg = new Package(project, 'name', 'void');

    expect(() => pkg.init()).toThrow(DowError);
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
    const pkg = new Package(project, 'name', 'https://github.com/appunto-io/dow-templates.git');

    pkg.init(templatedir);

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(true);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/testfile`)).toBe(true);
  })

  test('Remove package', () => {
    const project = new Project();
    project.init();

    const pkg = new Package(project, 'name', 'https://github.com/appunto-io/dow-templates.git');
    pkg.init();

    execSync('git init');
    execSync('git add -A', {cwd : path.resolve('.', PACKAGES_DIRECTORY, 'name')});
    execSync('git commit -m "package config file"', {cwd : path.resolve('.', PACKAGES_DIRECTORY, 'name')});
    execSync('git add -A');
    execSync('git commit -m "package"');

    pkg.remove();

    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name`)).toBe(false);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/.git`)).toBe(false);
    expect(fs.existsSync(`${PACKAGES_DIRECTORY}/name/${PACKAGE_CONFIG_FILE}`)).toBe(false);
  });
})
