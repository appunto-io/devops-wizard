
import Project from '../model/Project';
import { TmpType } from '../tools/tmp';

export interface Global extends NodeJS.Global {
  project : Project;
  tmp : TmpType;
  config : ProjectConfig;
}

export interface ProjectConfig {
  dowJsonVersion : string,
  templatesCatalog : string
}

export interface Template {
  name : string,
  description ?: string,
  repository ?: string
}