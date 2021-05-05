import {Argv, Arguments} from "yargs";

import runScript from '../../tools/run-script';
import findRoot from '../../tools/find-root';

export const command = 'add <repository> <name>';
export const describe = 'Add a submodule for an existing remote repository';

export const builder = (yargs : Argv) =>
  yargs
  .positional('repository', {
    describe : 'Remote repository'
  })
  .positional('name', {
    describe : 'Local name of the added package'
  })

export const handler = async (argv : Arguments<HandlerArguments>) => {
  const {repository, name} = argv;

  const root = findRoot();

  await runScript(`
    git submodule add ${repository} packages/${name}
    git add packages/${name}
    git add .gitmodules
  `, true, {cwd : root})
}

interface HandlerArguments {
  repository  : string,
  name       ?: string,
}
