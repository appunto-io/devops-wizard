import {Argv, Arguments} from "yargs";

import runScript from '../../tools/run-script';
import findRoot from '../../tools/find-root';

export const command = 'rm <name>';
export const aliases = ['remove']
export const describe = 'Remove a submodule';

export const builder = (yargs : Argv) =>
  yargs
  .positional('name', {
    describe : 'Name of submodule to remove'
  })

export const handler = async (argv : Arguments<HandlerArguments>) => {
  const { name } = argv;

  const root = findRoot();

  runScript(`
    git rm packages/${name}
    rm -rf .git/modules/packages/${name}
  `, true, {cwd : root})
}

interface HandlerArguments {
  name : string,
}
