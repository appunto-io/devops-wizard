import path from 'path';
import fs from 'fs';

import Project from './Project';
import { DEFAULT_DOW_JSON, PROJECT_CONFIG_FILE } from '../constants/defaults';
import DowError from './DowError';

class ProjectConfig {
  private project : Project;
  values : ProjectConfigValues

  constructor(project : Project) {
    this.project = project;
    this.values = this.load();
  }

  /**
   * Read config from file
   * @returns {ProjectConfigValues} Loaded values
   */
  load () {
    if (!this.project.isValid) {return DEFAULT_DOW_JSON;}

    const configFile = path.resolve(this.project.root, PROJECT_CONFIG_FILE);
    const loadedBuffer = fs.readFileSync(configFile);
    const config = JSON.parse(loadedBuffer.toString());

    return {...DEFAULT_DOW_JSON, ...config};
  }

  /**
   * Store config to file
   */
   save() {
    if (!this.project.isValid) {
      throw new DowError('Project should be initialized before saving configuration.')
    }

    const configFile = path.resolve(this.project.root, PROJECT_CONFIG_FILE);
    fs.writeFileSync(configFile, JSON.stringify(this.values, null, 2));
  }
}

export interface ProjectConfigValues {
  dowJsonVersion : string,
  catalogs : string[]
}

export default ProjectConfig;