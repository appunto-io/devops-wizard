import {Argv} from "yargs";


export const command = 'test'
export const describe = 'Testing dow structure'

export const builder = {
  banana: {
    default: 'cool'
  }
}


export const handler = (argv : Argv) => {
  console.dir(argv)
}