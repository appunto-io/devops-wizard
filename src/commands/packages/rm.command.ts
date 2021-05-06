import {Argv, Arguments} from "yargs";

import runScript from '../../tools/run-script';
import assertProject from '../../tools/assert-project';

import { Global } from '../../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = 'rm <name>';
export const aliases = ['remove']
export const describe = 'Remove a submodule';
export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of submodule to remove'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { name } = argv;

  assertProject();

  runScript(`
    git rm packages/${name}
    rm -rf .git/modules/packages/${name}
  `, true, {cwd : global.PROJECT_ROOT})
}

interface HandlerArguments {
  name : string,
}
