import util from 'util';
import { exec } from 'child_process';

const execPromise = util.promisify(exec);


/**
 * Execute a shell script
 *
 * @param {string} script - Shell script to be executed
 * @param {boolean} [verbose = false] - Show script result
 * @param {any} [options = {}] - Options provided to exec
 * @return {Promise} A promise that resolves when script is finished
 */
const runScript = async (script : string, verbose ?: boolean, options ?: any) => {
  const lines = script.split(/\n+/).map(l => l.trim()).filter(l => !!l.length);

  for(var l = 0; l < lines.length; l++) {
    const {stdout, stderr} = await execPromise(lines[l], options);

    if (verbose) {
      if (stdout) {
        console.log(stdout);
      }

      if (stderr) {
        console.log(stderr);
      }
    }
  }
};

export default runScript;