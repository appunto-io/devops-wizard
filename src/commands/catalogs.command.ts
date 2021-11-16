import {Argv} from "yargs";

import * as AddCommand from './catalogs/add.command'
import * as RmCommand from './catalogs/rm.command'
import * as ListCommand from './catalogs/list.command'

/*
  Yargs configuration
*/
export const command = 'catalogs';
export const aliases = ['catalog', 'c'];
export const describe = 'Manage templates catalog';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .command(AddCommand)
  .command(RmCommand)
  .command(ListCommand)
  // .commandDir('./catalogs', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = () => {}