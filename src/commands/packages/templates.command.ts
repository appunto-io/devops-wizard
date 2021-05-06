import {Argv, Arguments} from "yargs";

import getTemplates from '../../tools/get-templates';
import assertProject from '../../tools/assert-project';

import { Template } from '../../constants/types';

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

  assertProject();

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

