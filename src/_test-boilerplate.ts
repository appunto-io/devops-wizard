

import TestHelper from './model/TestHelper';
const testHelper = new TestHelper(process.env.CLEANUP_ON_EXIT !== 'false');
beforeAll(async () => testHelper.beforeAll());
afterAll(async () => testHelper.afterAll());

/********************************************/
/********************************************/
describe('XXXXX', () => {
  beforeEach(async () => testHelper.beforeEach());
  afterEach(async () => testHelper.afterEach());

  /********************************************/
  /********************************************/
  test('XXXXX', async () => {

  });
})
