import {Argv, Arguments} from "yargs";
import { prompt } from 'enquirer';


import Catalog from '../../model/Catalog';
import { TemplateValues } from '../../model/Template';

import { Global } from '../../constants/types';
import DowError from "../../model/DowError";
declare const global : Global;


/*
  Yargs configuration
*/
export const command = 'add [repository] [name]';
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
    describe : 'Use custom catalog to lookup template',
    type : 'string'
  })
  .option('template-repository', {
    description : 'Une the template in the provided repository',
    type : 'string',
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
  const {repository, name, template, catalog, templateRepository, interactive} = argv;

  global.project.assert();

  let selectedTemplateRepository : string;
  let selectedName : string;
  let selectedRepository : string;

  /*
    Retrieve a list of templates from catalogs
  */
  const getTemplates = () : TemplateValues[] => {
    if (catalog) {
      return new Catalog(catalog).templates
    }
    else {
      return global.project.getCatalogs().reduce(
        (templates : TemplateValues[], catalog : Catalog) => [...templates, ...catalog.templates],
        []
      );
    }
  }

  /*
    Ask user for name, remote repository an template if --interactive mode is on...
  */
  if(interactive) {
    let { name, repository, useTemplate } = await prompt<{name : string, repository : string, useTemplate : boolean}>([
      {
        name : 'name',
        message : 'Package name',
        type : 'input'
      },
      {
        name : 'repository',
        message : 'Package repository',
        type : 'input'
      },
      {
        name : 'useTemplate',
        message : 'Do you want to apply a template to this package?',
        type : 'confirm',
        initial : true
      }
    ]);
    selectedName = name;
    selectedRepository = repository;

    if(useTemplate) {
      const templates : TemplateValues[] = getTemplates();
      const choices : string[] = [];
      const choicesMap : {[key : string] : TemplateValues} = {};

      templates.forEach(
        (template : TemplateValues) => {
          const promptString = `${template.name} (${template.repository})${template.description ? '\n    ' + template.description : ''} `;
          choices.push(promptString);
          choicesMap[promptString] = template;
        }
      )

      let { template } = await prompt<{template : string}>({
        name : 'template',
        type : 'select',
        message : 'Choose template to apply',
        choices : choices
      })
      selectedTemplateRepository = choicesMap[template].repository;
    }
  }
  /*
    ...or continue with positional arguments
  */
  else {
    selectedName = name;
    selectedRepository = repository;

    if (templateRepository) {
      selectedTemplateRepository = templateRepository;
    }
    else if (template) {
      const templates : TemplateValues[] = getTemplates();
      const selectedTemplate = templates.find(({name} : TemplateValues) => name === template);

      if (selectedTemplate) {
        selectedTemplateRepository = selectedTemplate.repository;
      }
      else {
        throw new DowError(`Unable to find template '${template}'`);
      }
    }
  }

  if (!selectedName || !selectedRepository) {
    throw new DowError('Please either user --interactive mode or provide name and repository arguments.')
  }

  global.project.addPackage(selectedName, selectedRepository, {templateRepository : selectedTemplateRepository})
}

interface HandlerArguments {
  repository          : string,
  name               ?: string,
  template           ?: string,
  catalog            ?: string,
  interactive        ?: boolean
  templateRepository ?: string
}
