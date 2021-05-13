
import Project from '../model/Project';

export interface Global extends NodeJS.Global {
  project : Project;
  dowDebug ?: string;
}
declare const global : Global;
