
import Project from '../model/Project';

export interface Global extends NodeJS.Global {
  project : Project;
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