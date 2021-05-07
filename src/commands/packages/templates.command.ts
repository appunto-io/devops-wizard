import {Argv, Arguments} from "yargs";

import getTemplates from '../../tools/get-templates';

import { Template, Global } from '../../constants/types';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = 'templates';
export const describe = 'List all available templates';
export const builder = (yargs : Argv) =>
  yargs
  .option('catalog', {
    alias : 'c',
    describe : 'Path to remote repository containing templates definition',
    type : 'string'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { catalog } = argv;

  global.project.assert();

  const templates = await getTemplates(catalog);

  templates.forEach(
    (template : Template) => {
      console.log(`   ${template.name} : ${template.description || ''}`);
    }
  )
}

interface HandlerArguments {
  catalog : string,
}

