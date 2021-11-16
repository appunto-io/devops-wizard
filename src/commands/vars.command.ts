import {Argv} from "yargs";

import * as AddCommand from './vars/add.command';
import * as InitCommand from './vars/init.command';
import * as ListCommand from './vars/list.command';
import * as RmCommand from './vars/rm.command';

/*
  Yargs configuration
*/
export const command = 'envvars';
export const aliases = ['vars', 'var', 'v'];
export const describe = 'Manage package environment variables';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .command(AddCommand)
  .command(InitCommand)
  .command(ListCommand)
  .command(RmCommand)
  // .commandDir('./vars', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = () => {}