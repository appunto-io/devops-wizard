import { Argv, Arguments} from "yargs";
import fs from 'fs';
import path from 'path';
import { prompt } from 'enquirer';
import Mustache from 'mustache';
import DowError from "../../model/DowError";

import getTargetPackage from './tools/getTargetPackage';

/*
  Yargs configuration
*/
export const command = 'init';
export const describe = '';
export const builder = (yargs : Argv) =>
  yargs
  .option('interactive', {
    alias : ['i'],
    describe : 'Use interactive mode.',
    default : false,
    type : 'boolean'
  })
  .options('package', {
    alias : ['p'],
    describe : 'Target package',
    type : 'string'
  })
  .options('use-defaults', {
    alias : ['d'],
    describe : 'Use defaults as fallback values',
    default : false,
    type : 'boolean'
  })
  .options('use-env', {
    alias : ['e'],
    describe : 'Read values from env',
    default : false,
    type : 'boolean'
  })
  .options('source', {
    alias : ['s'],
    describe : 'Source file (.env format)'
  })
  .options('output', {
    alias : ['o'],
    describe : 'Output file.',
  })
  .options('output-template', {
    describe : 'Mustache formatted template file',
  })

const DOTENV_TEMPLATE =
`{{#____values}}
{{key}}={{value}}
{{/____values}}
`;
const DOT_ENV = '.env';

/*
  Command handler
*/
export const handler = async (argv : Arguments<HandlerArguments>) => {
  let { interactive, package : targetPackage, source, output, outputTemplate, useDefaults, useEnv } = argv;

  const pkg = getTargetPackage(targetPackage);

  if(!pkg.root) {
    throw new DowError('Cannot get environment variables outside of a package folder. CD to a package folder or use --package option.');
  }

  const config = pkg.getConfig();

  const configOutput = config.values.outputEnvFile && path.resolve(pkg.root, config.values.outputEnvFile);
  const configOutputTemplate = config.values.outputEnvTemplate && path.resolve(pkg.root, config.values.outputEnvTemplate);

  outputTemplate = outputTemplate || configOutputTemplate;
  output         = output || configOutput;

  if(outputTemplate && !output) {
    throw new DowError('--output-template or "outputEnvTemplate" used without --output.');
  }

  if(!output) {
    output = DOT_ENV;
  }

  let values : Record<string, string> = {};

  if(useDefaults) {
    values = {...config.values.vars};
  }

  if(useEnv) {
    values = {...values, ...process.env}
  }

  if(source) {
    let sources = Array.isArray(source) ? source : [source];

    sources.forEach(source => {
      if(fs.statSync(source).isFile()) {
        fs.readFileSync(source)
          .toString()
          .split(/\n/g)
          .map(line => line.split('='))
          .filter(([key]) => !!key && key[0] !== '#')
          .forEach(
            ([key, value]) => {
              values[key] = value
            }
          )
      }
      else {
        throw new DowError(`Unable to stat source file ${source}`);
      }
    })
  }

  if(interactive) {
    const results = await prompt<{[key : string] : string}>(
      Object.keys(config.values.vars).map(key => ({
        name : key,
        message : key,
        type : 'input',
        initial : values[key] === undefined ? undefined : `${values[key]}`
      }))
    );

    values = {...values, ...results};
  }

  const sanitizedValues : Record<string, string> = Object.keys(config.values.vars).reduce(
    (sanitizedValues, key) => {
      if(key in values) {
        sanitizedValues[key] = values[key];
      }
      return sanitizedValues;
    },
    {} as Record<string, string>
  );

  Object.keys(config.values.vars).forEach(
    key => {
      if(!(key in sanitizedValues)) {
        throw new DowError(`Missing var ${key}`);
      }
    }
  )

  let template = DOTENV_TEMPLATE;
  if(outputTemplate) {
    try {
      template = fs.readFileSync(outputTemplate).toString();
    }
    catch(error) {
      throw new DowError(`Unable to read template file ${outputTemplate}`);
    }
  }

  const formatted = Mustache.render(template, {
    ...sanitizedValues,
    ____values : Object.entries(sanitizedValues).map(([key, value]) => ({key, value}))
  });

  try {
    fs.writeFileSync(output, formatted);
  }
  catch(error) {
    throw new DowError(`Unable write output file ${output}`);
  }
}

interface HandlerArguments {
  interactive : boolean,
  package ?: string,
  source ?: string | string[],
  output ?: string,
  outputTemplate ?: string;
  useDefaults ?: boolean;
  useEnv ?: boolean;
}
