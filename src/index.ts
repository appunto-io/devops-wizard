#!/usr/bin/env node

import fs from 'fs';


import { Global } from './constants/types';
import {
  COMMANDS_PATH,
  SCRIPT_NAME
} from './constants/defaults';

import readConfig from './tools/read-config';
import Tmp from './tools/tmp';

import Project from './model/Project';
import DowError from './model/DowError';

import packageJson from '../package.json';

declare const global: Global;


/*
  Define global values
*/
global.project = new Project();
global.PROJECT_ROOT = global.project.root;
global.tmp = new Tmp();
global.config = readConfig();

/*
  Remove temporary directories on exit
*/
const cleanup = () => global.tmp.cleanup();
process.on('exit', cleanup)

process.on('uncaughtException', (err : any, origin : any) => {
  process.exitCode = 1;

  if(err instanceof DowError) {
    cleanup();
    fs.writeSync(process.stderr.fd, `ERROR: ${err.message}\n`);
  }
  else {
    fs.writeSync(
      process.stderr.fd,
      `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
    );
  }
});

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
