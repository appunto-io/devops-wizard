import {ProjectConfig} from './types';

export const PROJECT_CONFIG_FILE = '.dow.json';

export const DEFAULT_TEMPLATE_REPOSITORY = 'https://github.com/appunto-io/dow-templates.git';

export const DEFAULT_DOW_JSON : ProjectConfig = {
  dowJsonVersion : '1.0.0',
  templatesRepository : DEFAULT_TEMPLATE_REPOSITORY
};