import { Arguments } from "yargs";

import { Global } from '../../constants/types';
import Catalog from '../../model/Catalog';
import Template from '../../model/Template';
declare const global : Global;

/*
  Yargs configuration
*/
export const command = ['list', '$0'];
export const describe = 'List all templates';
export const builder = {};

/*
  Command handler
*/
export const handler = async (argv : Arguments<{}>) => {
  global.project.assert();

  const catalogs = global.project.getConfig().values.catalogs;

  catalogs.forEach((catalogUrl : string) => {
    const catalog = new Catalog(catalogUrl);

    console.log(`Catalog: ${catalog.catalogUrl} (${catalog.templates.length} templates)`);

    catalog.templates.forEach(
      (template : Template) => {
        console.log(`  ${template.name}` + (template.description ? ` - ${template.description}` : ''));
      }
    )

  })
}