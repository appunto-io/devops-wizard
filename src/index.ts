#!/usr/bin/env node

import fs from 'fs';
import tmp from 'tmp';
import yargs, { Argv } from 'yargs';

import {
  COMMANDS_PATH,
  SCRIPT_NAME
} from './constants/defaults';

import Project from './model/Project';
import DowError from './model/DowError';

import packageJson from '../package.json';

import { Global } from './constants/types';
declare const global: Global;

import * as CatalogsCommand from './commands/catalogs.command';
import * as InitCommand from './commands/init.command';
import * as PackagesCommand from './commands/packages.command';
import * as TemplatesCommand from './commands/templates.command';
import * as VarsCommand from './commands/vars.command';


/*
  Ask tmp to remove all temporary directories on exit
*/
tmp.setGracefulCleanup();

/*
  Define global values
*/
global.project = new Project();

/*
  Handle unhandled rejection and exceptions
*/
const exceptionHandler = (err : any, origin : any) => {
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
};
process.on('uncaughtException', exceptionHandler);
process.on('unhandledRejection', exceptionHandler)

/*
  Just start a simple instance of yargs parser and delegate commands
  execution to separate handlers stored in ./commands/ directory.
*/
// require('yargs')
yargs
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
    ({debug} : {debug : boolean}) => {
      global.dowDebug = debug;
    }
  ])
  .demandCommand(1, 'You need at least one command')
  .strictCommands()
  .command(CatalogsCommand)
  .command(InitCommand)
  .command(PackagesCommand)
  .command(TemplatesCommand)
  .command(VarsCommand)
  // .commandDir(
  //   COMMANDS_PATH,
  //   {extensions: ['command.js']}
  // )
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
