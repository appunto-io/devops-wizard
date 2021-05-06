
import { TmpType } from '../tools/tmp';

export interface Global extends NodeJS.Global {
  PROJECT_ROOT: string;
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