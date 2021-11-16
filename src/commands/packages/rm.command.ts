import {Argv, Arguments} from "yargs";
import fs from 'fs';
import path from 'path';
import { prompt } from 'enquirer';

import DowError from "../../model/DowError";
import Package from '../../model/Package';

import { PACKAGES_DIRECTORY } from "../../constants/defaults";

import { Global } from '../../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = 'rm [name]';
export const aliases = ['remove']
export const describe = 'Remove a submodule';
export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of submodule to remove',
    type : 'string'
  })
  .options('interactive', {
    alias : 'i',
    description : 'Use interactive mode',
    type : 'boolean'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { name, interactive } = argv;

  global.project.assert();

  let selectedName : string = name;

  if(interactive) {
    const packagesPath = path.resolve(global.project.root, PACKAGES_DIRECTORY);
    const packages : string[] = fs.readdirSync(packagesPath);

    selectedName = (await prompt<{name : string}>({
      type : 'select',
      name : 'name',
      message : 'Select package to remove or CTRL-C to abort.',
      choices : packages
    })).name;
  }

  if (!selectedName) {
    throw new DowError('Please either user --interactive mode or provide package name.');
  }

  const { removePackage } = await prompt<{removePackage : boolean}>({
    type: 'confirm',
    name: 'removePackage',
    message: `Reference to package ${selectedName} will be removed from project. Continue?`
  })

  if (!removePackage) {return;}

  global.project.removePackage(selectedName);
}

interface HandlerArguments {
  name : string,
  interactive : boolean
}
