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
  global.project.init();
}