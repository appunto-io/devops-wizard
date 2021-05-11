import { Argv, Arguments} from "yargs";

import { Global } from '../../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = 'add <repository>';
export const describe = 'Add a catalog to current project';
export const builder = (yargs : Argv) =>
  yargs
  .positional('repository', {
    describe : 'Catalog repository'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { repository } = argv;

  global.project.assert();

  const config = global.project.getConfig()
  config.values.catalogs.push(repository);
  config.save();
}

interface HandlerArguments {
  repository : string,
}
