import { Arguments} from "yargs";

import Package from "../../model/Package";
import Project from "../../model/Project";

/*
  Yargs configuration
*/
export const command = ['list', '$0'];
export const describe = 'List all packages';
export const builder = {};

/*
  Command handler
*/
export const handler = async (argv : Arguments<{}>) => {
  const project = new Project();
  project.assert();

  Object.entries(project.getPackages()).forEach(
    ([packageName, pkg] : [string, Package]) => console.log(`${packageName} - ${pkg.getConfig().values.remote}`)
  )
}