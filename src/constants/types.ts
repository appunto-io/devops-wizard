
import Project from '../model/Project';

export interface Global extends NodeJS.Global {
  project : Project;
  dowDebug ?: string;
}
declare const global : Global;


export interface ProjectConfig {
  dowJsonVersion : string,
  catalogs : string[]
}

export interface Template {
  name : string,
  description ?: string,
  repository ?: string
}