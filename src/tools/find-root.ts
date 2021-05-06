import fs from 'fs';
import path from 'path';

import { PROJECT_CONFIG_FILE } from '../constants/defaults';

/**
 * Finds the pathname of the parent project
 * @returns {string | null} The path of the root project or null
 */
const findRoot = (directory ?: string) : string | null => {
  if (!directory) {
    directory = path.resolve('.');
  }

  var file = path.resolve(directory, PROJECT_CONFIG_FILE);

  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return directory;
  }

  var parent = path.resolve(directory, '..');

  if (parent === directory) {
    return null;
  }

  return findRoot(parent);
}

export default findRoot;