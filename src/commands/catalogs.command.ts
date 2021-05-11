import {Argv} from "yargs";

/*
  Yargs configuration
*/
export const command = 'catalogs';
export const aliases = ['catalog', 'c'];
export const describe = 'Manage templates catalog';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .commandDir('./catalogs', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = (argv : Argv) => {}