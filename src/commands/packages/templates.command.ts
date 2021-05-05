import {Argv, Arguments} from "yargs";

import readConfig from '../../tools/read-config';
import getTemplates from '../../tools/get-templates';

import { Template } from '../../contants/types';

const Config = readConfig();

export const command = 'templates';
export const describe = 'List all available templates';

export const builder = (yargs : Argv) =>
  yargs
  .option('r', {
    alias : 'repository',
    describe : 'Path to remote repository containing templates definition',
    default : Config.templatesRepository,
    type : 'string'
  })

export const handler = async (argv : Arguments<HandlerArguments>) => {
  const {repository} = argv;
  const templates = await getTemplates(repository);

  templates.forEach(
    (template : Template) => {
      console.log(`   ${template.name} : ${template.description || ''}`);
    }
  )
}

interface HandlerArguments {
  repository : string,
}

