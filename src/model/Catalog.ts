import fs from 'fs';

import Project from "./Project";
import Template, { TemplateParameters } from './Template';
import DowError from './DowError';

import runScript from '../tools/run-script';

/**
 * Handles the list of templates referenced by this project
 */
class Catalog {
  private project : Project;
  templates : Template[];

  constructor (project : Project) {
    this.project = project;
    this.templates = [];
  }

  /**
   * Loads catalog
   * @returns {Template[]} A list of templates
   */
  async load () {
    const tmp : string = await this.project.getTmp();
    const catalog : string = this.project.getConfig().values.templatesCatalog;

    let templates : TemplateParameters[]= [];

    try {
      await runScript(`
        git clone ${catalog} ${tmp}
      `, false)

      const templateFile = `${tmp}/templates.json`;

      if (!fs.existsSync(templateFile) || !fs.statSync(templateFile).isFile()) {
        throw new DowError('Unable to find templates.json file in specified templates repository');
      }

      const templatesConfig : {templates : TemplateParameters[]} = require(templateFile);

      templates = (templatesConfig || {templates : []}).templates;
    }
    catch(error) {
      console.error(error);
    }

    this.templates = templates.map((template : TemplateParameters) => new Template(template));
    return this.templates;
  }
}

export default Catalog;