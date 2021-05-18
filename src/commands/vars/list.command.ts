import { Arguments, Argv } from "yargs";
import DowError from "../../model/DowError";
import Project from "../../model/Project";
import Package from '../../model/Package';
import getTargetPackage from "./tools/getTargetPackage";


/*
  Yargs configuration
*/
export const command = ['list [pattern]', '$0'];
export const describe = 'List all environment variables';
export const builder = (yargs : Argv) =>
  yargs
  .positional('pattern', {
    describe : 'Pattern used to filter environment variables'
  })
  .options('package', {
    alias : ['p'],
    describe : 'Limit listing to specified package',
    type : 'string'
  })

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { pattern, package : targetPackage } = argv;

  const project = new Project();

  const pkg = getTargetPackage(targetPackage);

  if(!pkg.root && !project.isValid) {
    throw new DowError('You are outside of a project or package directory.');
  }

  if(pkg.root) {
    listPackageVars(pkg, '', pattern);
  }
  else {
    Object.entries(project.getPackages())
      .forEach(
        ([name, pkg] : [string, Package]) => {
          console.log(`Package ${name}:`);
          listPackageVars(pkg, '   ', pattern);
        }
      )
  }
}

const listPackageVars = (pkg : Package, prefix : string, pattern ?: string) => {
  let entries = Object.entries(pkg.getConfig().values.vars);

  if (pattern) {
    entries = entries.filter(([name , value] : [string, string]) => name.match(pattern))
  }

  entries.forEach(
    ([key, value] : [string, string]) => {
      console.log(`${prefix}${key}=${value}`);
    }
  )
}

interface HandlerArguments {
  pattern : string,
  package : string
}
