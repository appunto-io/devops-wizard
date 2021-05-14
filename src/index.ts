#!/usr/bin/env node

import fs from 'fs';
import tmp from 'tmp';
import { Argv } from 'yargs';

import {
  COMMANDS_PATH,
  SCRIPT_NAME
} from './constants/defaults';

import Project from './model/Project';
import DowError from './model/DowError';

import packageJson from '../package.json';

import { Global } from './constants/types';
declare const global: Global;

/*
  Ask tmp to remove all temporary directories on exit
*/
tmp.setGracefulCleanup();

/*
  Define global values
*/
global.project = new Project();

/*
  Remove temporary directories on exit
*/
process.on('uncaughtException', (err : any, origin : any) => {
  process.exitCode = 1;

  if(err instanceof DowError) {
    fs.writeSync(process.stderr.fd, `ERROR: ${err.message}\n`);
  }
  else {
    // if(global.dowDebug) {
      fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}`
      );
    // }
    // else {
    //   fs.writeSync(
    //     process.stderr.fd,
    //     'Internal error. Use --debug to get more information.\n'
    //   );
    // }
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
  .options({
    'debug' : {
      global : true,
      type : 'boolean'
    }
  })
  .middleware([
    ({debug} : {debug : 'boolean'}) => {
      global.dowDebug = debug;
    }
  ])
  .demandCommand(1, 'You need at least one command')
  .strictCommands()
  .commandDir(
    COMMANDS_PATH,
    {extensions: ['command.js']}
  )
  .fail((msg : string, err : any, yargs : Argv) => {
    if (err) {
      process.exitCode = 1;

      if(err instanceof DowError) {
        fs.writeSync(process.stderr.fd, `ERROR: ${err.message}\n`);
      }
      else {
        if(global.dowDebug) {
          fs.writeSync(
            process.stderr.fd,
            `Caught exception: ${err}\n`
          );
        }
        else {
          fs.writeSync(
            process.stderr.fd,
            '  UNEXPECTED ERROR. Use --debug to get more information.\n'
          );
        }
      }
    }
    if (msg) {
      console.error(yargs.help());
      console.error("")
      console.error(msg)
      process.exit(1)
    }
  })
  .argv;
