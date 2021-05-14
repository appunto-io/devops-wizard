import {Argv} from "yargs";

/*
  Yargs configuration
*/
export const command = 'envvars';
export const aliases = ['vars', 'var', 'v'];
export const describe = 'Manage package environment variables';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .commandDir('./vars', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = (argv : Argv) => {}