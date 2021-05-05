import fs from 'fs';

import runScript from './run-script';
import findRoot from './find-root';

import { Template } from '../contants/types';

const getTemplates = async (repository : string) : Promise<Template[]> => {
  const root = findRoot();
  const tmpDirectory = `.tmp${Math.round(Math.random()*100000)}`;
  let templates = [];

  await runScript(`
    mkdir ${tmpDirectory}
  `, true, {cwd : root});

  try {
    await runScript(`
      git clone ${repository} ${tmpDirectory}
    `, false, {cwd : root})

    const templateFile = `${root}/${tmpDirectory}/templates.json`;

    if (!fs.existsSync(templateFile) || !fs.statSync(templateFile).isFile()) {
      throw new Error('Unable to find templates.json file in specified templates repository');
    }

    const templatesConfig = require(templateFile);

    templates = (templatesConfig || {templates : []}).templates;
  }
  catch(error) {
    console.error(error);
  }

  await runScript(`
    rm -rf ${tmpDirectory}
  `, true, {cwd : root});

  return templates;
}

export default getTemplates;
