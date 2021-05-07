import path from 'path';

import { DEFAULT_DOW_JSON, PROJECT_CONFIG_FILE } from '../constants/defaults';
import { ProjectConfig, Global } from '../constants/types';
declare const global : Global;

const readConfig = () : ProjectConfig => {
  const root = global.project.root;

  if (!root) {return DEFAULT_DOW_JSON;}

  // If root exists, it means that a project config file have been found
  const configFile = path.resolve(root, PROJECT_CONFIG_FILE);
  const config = require(configFile);

  return {...DEFAULT_DOW_JSON, ...config};
}

export default readConfig;