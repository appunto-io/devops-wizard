import {Argv} from "yargs";


export const command = 'packages';
export const aliases = ['package'];
export const describe = 'Handle project packages';

export const builder = (yargs : Argv) =>
  yargs
  .demandCommand(1, 'You need at least one command')
  .commandDir('./packages', {extensions: ['command.js']})

export const handler = (argv : Argv) => {
  console.dir(argv)
}