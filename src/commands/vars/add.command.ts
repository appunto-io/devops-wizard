import { Argv, Arguments} from "yargs";
import { prompt } from 'enquirer';
import DowError from "../../model/DowError";

import getTargetPackage from './tools/getTargetPackage';

/*
  Yargs configuration
*/
export const command = 'add [name] [default-value]';
export const describe = 'Add an environment variable to current package';
export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of environment variable',
    type : 'string'
  })
  .positional('default', {
    describe : 'Default value',
    type : 'string'
  })
  .option('interactive', {
    alias : ['i'],
    describe : 'Use interactive mode. Default mode if name is not provided',
    default : false,
    type : 'boolean'
  })
  .option('force', {
    alias : ['f'],
    describe : 'Overwrite existing environment variable without failing',
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
  const { name, default : defaultValue, interactive, force, package : targetPackage} = argv;

  let selectedName : string = name;
  let selectedDefaultValue : string = defaultValue;

  const pkg    = getTargetPackage(targetPackage);
  const config = pkg.getConfig();

  if(!pkg.root) {
    throw new DowError('Cannot set environment variables outside of a package folder.');
  }

  if(interactive || !name) {
    const {name} = await prompt<{name : string}>([
      {
        name : 'name',
        message : 'Name of environment variable',
        type : 'input',
        initial : selectedName
      }
    ]);

    const {defaultValue} = await prompt<{defaultValue : string}>([
      {
        name : 'defaultValue',
        message : 'Default value',
        type : 'input',
        initial : config.values?.vars[name]
      }
    ]);

    selectedName = name;
    selectedDefaultValue = defaultValue;
  }

  if(!selectedName) {return;}

  if(config.values?.vars?.[selectedName] && !force && !interactive && name) {
    throw new DowError(`Variable ${selectedName} exist. Use --force|-f to overwrite.`);
  }

  config.values.vars = {
    ...config.values.vars,
    [selectedName] : `${selectedDefaultValue || ''}`
  }

  config.save();
}

interface HandlerArguments {
  name : string,
  default : string,
  interactive : boolean,
  force : boolean,
  package : string
}
