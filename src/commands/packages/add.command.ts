import {Argv, Arguments} from "yargs";
import runScript from '../../tools/run-script';

export const command = 'rm <name>';
export const aliases = ['remove']
export const describe = 'Remove a submodule';

export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of submodule to remove'
  })

export const handler = async (argv : Arguments<HandlerArguments>) => {
  const {name} = argv;

  runScript(`
    git rm packages/${name}
    rm -rf .git/modules/packages/${name}
  `, true)
}

interface HandlerArguments {
  name : string,
}
