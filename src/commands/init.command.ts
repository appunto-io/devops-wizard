import fs from 'fs';
import path from 'path';

import {PROJECT_CONFIG_FILE} from '../contants/defaults';
import findRoot from '../tools/find-root';

const DEFAULT_DOW_JSON = {
  dowJsonVersion : '1.0.0'
}

export const command = 'init';
export const aliases = ['i'];
export const describe = `Creates a ${PROJECT_CONFIG_FILE} file`;
export const builder = {}

export const handler = () => {
  const file = path.resolve('.', PROJECT_CONFIG_FILE)

  if (fs.existsSync(file)) {
    console.error(`ERROR : A ${PROJECT_CONFIG_FILE} file already exists in this directory`);
    return;
  }

  const root = findRoot();
  if (root) {
    console.error(`ERROR : One ancestor already contains a ${PROJECT_CONFIG_FILE} file`);
    return;
  }

  fs.appendFileSync(PROJECT_CONFIG_FILE, JSON.stringify(DEFAULT_DOW_JSON, null, 2));
}