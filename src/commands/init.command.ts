import fs from 'fs';
import path from 'path';

import { PROJECT_CONFIG_FILE, DEFAULT_DOW_JSON } from '../constants/defaults';

import { Global } from '../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = 'init';
export const aliases = ['i'];
export const describe = `Creates a ${PROJECT_CONFIG_FILE} file`;
export const builder = {}

/*
  Command handler
*/
export const handler = () => {
  const file = path.resolve('.', PROJECT_CONFIG_FILE)

  if (fs.existsSync(file)) {
    console.error(`ERROR : A ${PROJECT_CONFIG_FILE} file already exists in this directory`);
    return;
  }

  const root = global.PROJECT_ROOT;
  if (root) {
    console.error(`ERROR : One ancestor already contains a ${PROJECT_CONFIG_FILE} file`);
    return;
  }

  fs.appendFileSync(PROJECT_CONFIG_FILE, JSON.stringify(DEFAULT_DOW_JSON, null, 2));
}