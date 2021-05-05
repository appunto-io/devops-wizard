import {Argv, Arguments} from "yargs";
import runScript from '../../tools/run-script';

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

  runScript(`
    git submodule add ${repository} packages/${name}
    git add packages/${name}
    git add .gitmodules
  `, true)
}

interface HandlerArguments {
  repository  : string,
  name       ?: string,
}
