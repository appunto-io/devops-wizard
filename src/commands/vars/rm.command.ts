import { Argv, Arguments} from "yargs";
import { prompt } from 'enquirer';
import DowError from "../../model/DowError";

import getTargetPackage from './tools/getTargetPackage';

/*
  Yargs configuration
*/
export const command = 'rm [name]';
export const describe = 'Remove an environment variable from current package';
export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of environment variable'
  })
  .option('interactive', {
    alias : ['i'],
    describe : 'Use interactive mode. Default mode if name is not provided',
    default : false,
    type : 'boolean'
  })
  .options('package', {
    alias : ['p'],
    describe : 'Target package',
    type : 'string'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { name, interactive, package : targetPackage} = argv;

  let selectedName : string = name;

  const pkg    = getTargetPackage(targetPackage);
  const config = pkg.getConfig();

  if(!pkg.root) {
    throw new DowError('Cannot remove environment variables outside of a package folder.');
  }

  if(interactive || !name) {
    const {name} = await prompt<{name : string}>([
      {
        name : 'name',
        message : 'Name of environment variable to be removed',
        type : 'input',
        initial : selectedName
      }
    ]);

    selectedName = name;
  }

  if(!selectedName) {return;}

  const {[selectedName] : toBeRemoved, ...rest } = config.values?.env || {};
  config.values.env = rest;

  config.save();
}

interface HandlerArguments {
  name : string,
  interactive : boolean,
  package : string
}
