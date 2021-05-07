import fs from 'fs';

import runScript from './run-script';
import assertProject from './assert-project';

import { Global, Template } from '../constants/types';
declare const global : Global;

const getTemplates = async (catalog ?: string) : Promise<Template[]> => {
  assertProject();

  catalog = catalog || global.config.templatesCatalog;

  const tmpDirectory = await global.project.getTmp();
  let templates = [];

  try {
    await runScript(`
      git clone ${catalog} ${tmpDirectory}
    `, false)

    const templateFile = `${tmpDirectory}/templates.json`;

    if (!fs.existsSync(templateFile) || !fs.statSync(templateFile).isFile()) {
      throw new Error('Unable to find templates.json file in specified templates repository');
    }

    const templatesConfig = require(templateFile);

    templates = (templatesConfig || {templates : []}).templates;
  }
  catch(error) {
    console.error(error);
  }

  return templates;
}

export default getTemplates;
