import util from 'util';
import { exec } from 'child_process';

const execPromise = util.promisify(exec);

/**
 * Execute a shell command
 *
 * @param {string} command - Shell command
 * @param {boolean} [verbose = false] - Show command result
 * @param {any} [options = {}] - Options provided to exec
 * @return {Promise} A promise that resolves when command is finished
 */
const runCommand = async (command : string, verbose ?: boolean, options ?: any) : Promise<CommandResult> => {
  const {stdout, stderr} = await execPromise(command, options);

  const stdoutString = `${stdout}`;
  const stderrString = `${stderr}`;

  if (verbose) {
    if (stdoutString) {
      console.log(stdoutString);
    }

    if (stderrString) {
      console.log(stderrString);
    }
  }

  return {
    stdout : stdoutString,
    stderr : stderrString
  }
};

interface CommandResult {
  stdout : string,
  stderr : string
}

export default runCommand;