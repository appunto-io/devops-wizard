import fs from 'fs';
import tmp from 'tmp';

import Project from "./Project";
import Template, { TemplateValues } from './Template';
import DowError from './DowError';

import runScriptSync from '../tools/run-script-sync';

/**
 * Handles the list of templates referenced by this project
 */
class Catalog {
  readonly catalogUrl : string;
  templates : Template[] = [];

  /**
   * Constructor
   * 
   * @param {string} [catalogUrl] Url of templates catalog repository
   */
  constructor (catalogUrl ?: string) {
    this.catalogUrl = catalogUrl;
    this.templates = this.load();
  }

  /**
   * Loads catalog
   * @returns {Template[]} A list of templates
   */
  private load () : Template[] {
    if (!this.catalogUrl) {return [];}

    const tmpDirectory : string = tmp.dirSync().name;

    let templates : TemplateValues[]= [];

    try {
      runScriptSync(`git clone ${this.catalogUrl} ${tmpDirectory}/`, false, {stdio : 'ignore'});
    }
    catch(error) {
      console.error(`  ERROR: Unable to clone catalog ${this.catalogUrl}. Aborting.`)
      return [];
    }

    const templateFile = `${tmpDirectory}/templates.json`;

    if (!fs.existsSync(templateFile) || !fs.statSync(templateFile).isFile()) {
      console.error('  ERROR: Unable to find templates.json file in specified templates repository. Aborting.');
      return [];
    }

    const templatesConfig : {templates : TemplateValues[]} = require(templateFile);

    templates = (templatesConfig || {templates : []}).templates;

    this.templates = templates.map((template : TemplateValues) => new Template(template));

    return this.templates;
  }
}

export default Catalog;