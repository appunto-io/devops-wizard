import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import EnvironmentTemplate from './EnvironmentTemplate';
import Package from './Package';

import { DEFAULT_PACKAGE_JSON, PACKAGE_CONFIG_FILE } from '../constants/defaults';


import TestHelper from './TestHelper';
const testHelper = new TestHelper('XXXX', process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('EnvironmentTemplate', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('Compare template with existing packages', async () => {
    const template = new EnvironmentTemplate({
      vars : {
        package1 : {
          var1 : {default : 'value1', encrypted : false},
          var2 : {default : 'value2', encrypted : false},
          var3 : {default : 'value3', encrypted : false}
        },
        package2 : {
          var1 : {default : 'value1', encrypted : false},
          var2 : {default : 'value2', encrypted : false},
          var3 : {default : 'value3', encrypted : false}
        },
        package3 : {
          var1 : {default : 'value1', encrypted : false},
          var2 : {default : 'value2', encrypted : false},
          var3 : {default : 'value3', encrypted : false}
        },
      },
      files : {}
    });

    execSync('mkdir package1');
    execSync('mkdir package2');
    execSync('mkdir package3');

    fs.writeFileSync(
      `./package1/${PACKAGE_CONFIG_FILE}`,
      JSON.stringify(
        {...DEFAULT_PACKAGE_JSON, vars : {var1 : 'value1', var2 : 'modified-value2', var4 : 'value4'}},
        null,
        2
      )
    );
    fs.writeFileSync(
      `./package2/${PACKAGE_CONFIG_FILE}`,
      JSON.stringify(
        {...DEFAULT_PACKAGE_JSON, vars : {var1 : 'value1', var3 : 'value3'}},
        null,
        2
      )
    );
    fs.writeFileSync(
      `./package3/${PACKAGE_CONFIG_FILE}`,
      JSON.stringify(
        {...DEFAULT_PACKAGE_JSON, vars : {var1 : 'value1', var2 : 'value2', var3 : 'value3', var4 : 'value4', var5 : 'value5'}},
        null,
        2
      )
    );

    const package1 = new Package(path.resolve('.', 'package1'));
    const package2 = new Package(path.resolve('.', 'package2'));
    const package3 = new Package(path.resolve('.', 'package3'));

    const testResults = template.test({
      package1,
      package2,
      package3
    })

    expect(testResults.changed).toEqual({
      package1 : ['var2']
    })
    expect(testResults.removed).toEqual({
      package1 : ['var3'],
      package2 : ['var2']
    })
    expect(testResults.added).toEqual({
      package1 : ['var4'],
      package3 : ['var4', 'var5']
    })
  });
})
