import {Argv} from "yargs";

/*
  Yargs configuration
*/
export const command = 'package';
export const aliases = ['packages', 'p'];
export const describe = 'Handle project packages';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .commandDir('./packages', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = (argv : Argv) => {}