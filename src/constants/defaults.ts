import { ProjectConfigValues } from '../model/ProjectConfig';
import { PackageConfigValues } from '../model/PackageConfig';

export const COMMANDS_PATH = './commands/';
export const SCRIPT_NAME = 'dow';

export const PACKAGES_DIRECTORY  = 'packages';
export const PROJECT_CONFIG_FILE = '.dow-project.json';
export const PACKAGE_CONFIG_FILE = '.dow-package.json';
export const TEMPLATES_FILE      = 'templates.json';

export const DEFAULT_TEMPLATES_CATALOG = 'https://github.com/appunto-io/dow-templates.git';

export const DEFAULT_DOW_JSON : ProjectConfigValues = {
  dowJsonVersion : '1.0.0',
  catalogs : [DEFAULT_TEMPLATES_CATALOG]
};

export const DEFAULT_PACKAGE_JSON : PackageConfigValues = {
  dowJsonVersion : '1.0.0',
  remote         : '',
  env            : {}
}