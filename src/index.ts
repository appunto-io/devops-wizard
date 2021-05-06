#!/usr/bin/env node

import { Global } from './constants/types';
import {
  COMMANDS_PATH,
  SCRIPT_NAME
} from './constants/defaults';

import findRoot from './tools/find-root';
import readConfig from './tools/read-config';
import Tmp from './tools/tmp';

import packageJson from '../package.json';

declare const global: Global;


/*
  Define global values
*/
global.PROJECT_ROOT = findRoot();
global.tmp = new Tmp();
global.config = readConfig();

/*
  Remove temporary directories on exit
*/
const cleanup = () => global.tmp.cleanup();
process.on('exit', cleanup)
process.on('uncaughtException', cleanup);
process.on('unhandledRejection', cleanup);

/*
  Just start a simple instance of yargs parser and delegate commands
  execution to separate handlers stored in ./commands/ directory.
*/
require('yargs')
  .locale('en')
  .help()
  .version(packageJson.version)
  .scriptName(SCRIPT_NAME)
  .demandCommand(1, 'You need at least one command')
  .commandDir(
    COMMANDS_PATH,
    {extensions: ['command.js']}
  )
  .argv;
