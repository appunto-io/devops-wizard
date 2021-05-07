
import Project from '../model/Project';
import TmpFactory from '../model/TmpFactory';

export interface Global extends NodeJS.Global {
  project : Project;
  tmp : TmpFactory;
  config : ProjectConfig;
}
declare const global : Global;


export interface ProjectConfig {
  dowJsonVersion : string,
  templatesCatalog : string
}

export interface Template {
  name : string,
  description ?: string,
  repository ?: string
}