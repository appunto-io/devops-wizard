
import Project from '../model/Project';

export interface Global extends NodeJS.Global {
  project : Project;
  dowDebug ?: boolean;
}
declare const global : Global;
