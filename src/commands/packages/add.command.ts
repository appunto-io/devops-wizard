import {Argv, Arguments} from "yargs";
import tmp from 'tmp';
import { prompt } from 'enquirer';

import runScript from '../../tools/run-script';
import getTemplates from '../../tools/get-templates';

import { Template, Global } from '../../constants/types';
declare const global : Global;


/*
  Yargs configuration
*/
export const command = 'add <repository> <name>';
export const describe = 'Add a submodule for an existing remote repository';
export const builder = (yargs : Argv) =>
  yargs
  .positional('repository', {
    describe : 'Remote repository'
  })
  .positional('name', {
    describe : 'Local name of the added package'
  })
  .option('template', {
    alias : 't',
    description : 'Initialize the submodule with the specified template',
    type : 'string',
  })
  .option('catalog', {
    alias : 'c',
    describe : 'Path to remote repository containing templates definition',
    type : 'string'
  })
  .option('template-repository', {
    description : 'Une the template in the provided repository',
    type : 'string',
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const {repository, name, template, catalog, templateRepository} = argv;

  global.project.assert();

  /*
    Handle template specification and ask user confirmation
  */
  let selectedTemplateRepository;
  if (templateRepository) {
    selectedTemplateRepository = templateRepository;
  }
  else if (template) {
    const templates = await getTemplates(catalog);
    const selectedTemplate = templates.find(({name} : Template) => name === template);

    if (selectedTemplate) {
      selectedTemplateRepository = selectedTemplate.repository;
    }
    else {
      console.error(`ERROR : Unable to find template '${template}'`)
      return;
    }
  }

  let templateDirectory : string = tmp.dirSync().name;
  if (selectedTemplateRepository) {
    const { applyTemplate } = await prompt<{applyTemplate : boolean}>({
      type: 'confirm',
      name: 'applyTemplate',
      message: `The content of the submodule ${name} will be replaced with the template. Confirm?`
    })

    if (!applyTemplate) {return;}

    try {
      await runScript(`git clone ${selectedTemplateRepository} ${templateDirectory}`, false);
    }
    catch(error) {
      console.error('ERROR : Unable to download specified template');
      process.exitCode = 1;
      return;
    }
  }

  /*
    Create submodule
  */
  await runScript(`
    git submodule add ${repository} packages/${name}
    git add packages/${name}
    git add .gitmodules
  `, true, {cwd : global.project.root})

  /*
    Apply template
  */
  if (selectedTemplateRepository) {
    const gitBackup : string = tmp.dirSync().name;

    await runScript(`
      mv packages/${name}/.git ${gitBackup}/
      rm -rf packages/${name}/**
      rm -rf ${templateDirectory}/.git
      cp -rf ${templateDirectory}/** packages/${name}/
      cp  ${gitBackup}/.git packages/${name}/
    `, false, {cwd : global.project.root})
  }
}

interface HandlerArguments {
  repository    : string,
  name         ?: string,
  template     ?: string,
  catalog      ?: string
}
