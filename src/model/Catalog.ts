import fs from 'fs';
import tmp from 'tmp';

import Project from "./Project";
import Template, { TemplateParameters } from './Template';
import DowError from './DowError';

import runScript from '../tools/run-script';

/**
 * Handles the list of templates referenced by this project
 */
class Catalog {
  private catalogUrl : string;
  templates : Template[];

  constructor (catalogUrl : string) {
    this.catalogUrl = catalogUrl;
    this.templates = [];
  }

  /**
   * Loads catalog
   * @returns {Template[]} A list of templates
   */
  async load () {
    try {
      const tmpDirectory : string = tmp.dirSync().name;

      let templates : TemplateParameters[]= [];

      await runScript(`git clone ${this.catalogUrl} ${tmpDirectory}/`, false);

      const templateFile = `${tmpDirectory}/templates.json`;

      if (!fs.existsSync(templateFile) || !fs.statSync(templateFile).isFile()) {
        throw new DowError('Unable to find templates.json file in specified templates repository');
      }

      const templatesConfig : {templates : TemplateParameters[]} = require(templateFile);

      templates = (templatesConfig || {templates : []}).templates;

      this.templates = templates.map((template : TemplateParameters) => new Template(template));
      return this.templates;
    }
    catch(error) {
      console.error(error);
    }
  }
}

export default Catalog;