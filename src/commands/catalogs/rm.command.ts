import { Argv, Arguments} from "yargs";
import Enquirer from 'enquirer';

import { Global } from '../../constants/types';
declare const global : Global;

// Uggly fix necessary due to lack of typing in enquirer
// https://github.com/enquirer/enquirer/issues/135
const Select = (Enquirer as any).Select;

/*
  Yargs configuration
*/
export const command = 'rm [repository]';
export const describe = 'Add a catalog to current project';
export const builder = (yargs : Argv) =>
  yargs
  .positional('repository', {
    describe : 'Catalog repository to be removed',
    type : 'string'
  })
  .option('interactive', {
    alias : ['i'],
    describe : 'Use interactive mode to select catalog to remove',
    type : 'boolean'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { repository, interactive } = argv;

  global.project.assert();

  const config = global.project.getConfig()
  const catalogs = config.values.catalogs;

  let catalogToDelete = repository;
  if(interactive) {
    const prompt = new Select({
      name: 'catalog',
      message: 'Choose the catalog to remove or CTRL+C to abort',
      choices: [...catalogs]
    });

    catalogToDelete = await prompt.run();

  }

  config.values.catalogs = catalogs.filter((catalog : string) => catalog !== catalogToDelete);
  config.save();
}

interface HandlerArguments {
  repository : string,
}
