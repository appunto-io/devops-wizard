import {Argv, Arguments} from "yargs";
const { prompt } = require('enquirer');

import runScript from '../../tools/run-script';
import runCommand from '../../tools/run-command';
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

  const { stdout : modified } = await runCommand(`git status packages/${name} --porcelain`, false, {cwd : global.project.root});

  if (modified) {
    console.error(`ERROR : Submodule ${name} was modified`)
    process.exitCode = 1;
    return;
  }

  const { removePackage } = await prompt({
    type: 'confirm',
    name: 'removePackage',
    message: `Reference to package ${name} will be removed from project. Continue?`
  })

  if (!removePackage) {return;}

  runScript(`
    git rm packages/${name}
    rm -rf .git/modules/packages/${name}
  `, true, {cwd : global.project.root})
}

interface HandlerArguments {
  name : string,
}
