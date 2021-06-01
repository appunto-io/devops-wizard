import { Arguments} from "yargs";
import { execSync } from 'child_process';

import Package from "../../model/Package";
import Project from "../../model/Project";

/*
  Yargs configuration
*/
export const command = ['init'];
export const describe = 'Init the package in current directory';
export const builder = {};

/*
  Command handler
*/
export const handler = async (argv : Arguments<{}>) => {
  const pkg = new Package('.');
  let remote : string = execSync('git remote get-url --push origin').toString().replace('\n', '');

  pkg.init({remote});
}