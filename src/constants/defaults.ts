import {ProjectConfig, PackageConfig} from './types';

export const COMMANDS_PATH = './commands/';
export const SCRIPT_NAME = 'dow';

export const PACKAGES_DIRECTORY  = 'packages';
export const PROJECT_CONFIG_FILE = '.dow-project.json';
export const PACKAGE_CONFIG_FILE = '.dow-package.json';
export const TEMPLATES_FILE      = 'templates.json';

export const DEFAULT_TEMPLATES_CATALOG = 'https://github.com/appunto-io/dow-templates.git';

export const DEFAULT_DOW_JSON : ProjectConfig = {
  dowJsonVersion : '1.0.0',
  catalogs : [DEFAULT_TEMPLATES_CATALOG]
};

export const DEFAULT_PACKAGE_JSON : PackageConfig = {
  dowJsonVersion : '1.0.0',
  remote         : ''
}