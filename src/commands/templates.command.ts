import {Argv} from "yargs";

import * as ListCommand from './templates/list.command';

/*
  Yargs configuration
*/
export const command = 'templates';
export const aliases = ['template', 't'];
export const describe = 'Manage templates';
export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .command(ListCommand)
  // .commandDir('./templates', {extensions: ['command.js']})

/*
  Command handler
*/
export const handler = () => {}