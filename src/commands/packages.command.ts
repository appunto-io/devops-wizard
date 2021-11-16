import {Argv} from "yargs";

import * as AddCommand from './packages/add.command';
import * as InitCommand from './packages/init.command';
import * as ListCommand from './packages/list.command';
import * as RmCommand from './packages/rm.command';

/*
  Yargs configuration
*/
export const command = 'packages';
export const aliases = ['package', 'p'];
export const describe = 'Handle project packages';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .command(AddCommand)
  .command(InitCommand)
  .command(ListCommand)
  .command(RmCommand)
  // .commandDir('./packages', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = () => {}