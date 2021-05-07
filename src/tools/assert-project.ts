import { Global } from '../constants/types';
declare const global : Global;

const assertProject = () : void => {
  if(!global.project.root) {
    throw new Error('ERROR : you need to be in a project folder.');
  }
}

export default assertProject;