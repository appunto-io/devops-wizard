import { Arguments} from "yargs";

import { Global } from '../../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = ['list', '$0'];
export const describe = 'List all catalogs';
export const builder = {};

/*
  Command handler
*/
export const handler = async (argv : Arguments<{}>) => {
  global.project.assert();

  const catalogs = global.project.getConfig().values.catalogs;

  catalogs.forEach((catalog : string) => {
    console.log(catalog);
  })
}