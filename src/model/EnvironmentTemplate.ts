import { string } from "yargs";
import Package from "./Package";

class EnvironmentTemplate {
  values : EnvironmentTemplateValues;

  constructor(values : EnvironmentTemplateValues) {
    this.values = values;
  }

  /**
   * Test if vars definition in provided package map is
   * well represented by existing evironment template vars
   *
   * @param packages Map of packages
   * @returns A structure with three fields, added, removed and changed.
   *          Each field holds a map of array with added, removed and modified
   *          Vars definition.
   */
  test(packages : {[name : string] : Package}) : {
    added : FoundVarsMap,
    removed : FoundVarsMap,
    changed : FoundVarsMap
  } {
    const added : FoundVarsMap = {};
    const removed : FoundVarsMap = {};
    const changed : FoundVarsMap = {};

    const add = (collection: FoundVarsMap, packageName : string, name : string) => {
      if(!collection[packageName]) {
        collection[packageName] = [];
      }
      collection[packageName].push(name);
    }

    /*
      Create a new template from packages and mark missing vars
    */
    const actual : {[packageName : string] : {[name : string] : boolean}} = {};
    Object.entries(packages).forEach(
      ([packageName, pkg] : [string, Package]) => {
        const varsMap : {[name : string] : boolean} = {};

        Object.entries(pkg.getConfig().values.vars).forEach(
          ([name, value]: [string, string]) => {
            varsMap[name] = true;

            if(!this.values.vars?.[packageName]?.[name]){
              add(added, packageName, name);
            }
            else if(this.values.vars[packageName][name].default !== value) {
              add(changed, packageName, name);
            }
          }
        )

        actual[packageName] = varsMap;
      }
    )

    /*
      Search for removed variables
    */
    Object.entries(this.values.vars).forEach(
      ([packageName, template] : [string, PackageTemplate]) => {
        Object.keys(template).forEach(
          (name : string) => {

            if(!actual?.[packageName]?.[name]){
              add(removed, packageName, name);
            }
          }
        )
      }
    )

    return {
      added,
      changed,
      removed
    };
  }
}

interface FoundVarsMap {[packageName : string] : string[]};

export interface VarTemplate {
  default : string
  encrypted ?: boolean
};

export interface FileTemplate {
  encrypted ?: boolean
}

export interface PackageTemplate {
  [name : string] : VarTemplate
};

export interface EnvironmentTemplateValues {
  vars : {
    [packageName : string] : PackageTemplate
  },
  files ?: {
    [path : string] : FileTemplate
  }
}

export default EnvironmentTemplate