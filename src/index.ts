import packageJson from '../package.json';

const COMMANDS_PATH = './commands/';
const SCRIPT_NAME = 'dow';

/*
  Just start a simple instance of yargs parser and delegate commands
  execution to separate handlers stored in ./commands/ directory.
*/
require('yargs')
  .locale('en')
  .help()
  .version(packageJson.version)
  .scriptName(SCRIPT_NAME)
  .demandCommand(1, 'You need at least one command')
  .commandDir(
    COMMANDS_PATH,
    {extensions: ['command.js']}
  )
  .argv;
