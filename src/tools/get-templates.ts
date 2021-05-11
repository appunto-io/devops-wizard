import fs from 'fs';
import tmp from 'tmp';

import runScript from './run-script';

import { Global, Template } from '../constants/types';
declare const global : Global;

const getTemplates = async (catalog ?: string) : Promise<Template[]> => {
  global.project.assert();

  catalog = catalog || global.project.getConfig().values.catalogs[0];

  const tmpDirectory : string = tmp.dirSync().name;
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
