import fs from 'fs';
import path from 'path';

import findRoot from './find-root';

import { DEFAULT_DOW_JSON, PROJECT_CONFIG_FILE } from '../contants/defaults';
import { ProjectConfig } from '../contants/types';

const readConfig = () : ProjectConfig => {
  const root = findRoot();
  const configFile = path.resolve(root, PROJECT_CONFIG_FILE);
  const config = require(configFile);

  return {...DEFAULT_DOW_JSON, ...config};
}

export default readConfig;