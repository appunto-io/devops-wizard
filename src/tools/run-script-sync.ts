import util from 'util';
import { execSync } from 'child_process';


/**
 * Execute a shell script
 *
 * @param {string} script - Shell script to be executed
 * @param {boolean} [verbose = false] - Show script result
 * @param {any} [options = {}] - Options provided to exec
 * @return {void}
 */
const runScriptSync = (script : string, verbose ?: boolean, options ?: any) => {
  const lines = script.split(/\n+/).map(l => l.trim()).filter(l => !!l.length);

    for(var l = 0; l < lines.length; l++) {
      const stdout = execSync(lines[l], options);
      const stdoutString = stdout && stdout.toString() || '';

      if (verbose) {
        if (stdoutString) {
          console.log(stdoutString);
        }
      }
    }
};

export default runScriptSync;