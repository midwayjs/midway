'use strict';

const yargs = require('yargs');

const getParserOptions = () => {
  return {
    type: {
      type: 'string',
      description: 'boilerplate type',
    },
    dir: {
      type: 'string',
      description: 'target directory',
    },
    template: {
      type: 'string',
      description: 'local path to boilerplate',
    },
    package: {
      type: 'string',
      description: 'boilerplate package name',
    },
    registry: {
      type: 'string',
      description: 'npm registry, support china/npm/custom, default to auto detect',
      alias: 'r',
    },
    silent: {
      type: 'boolean',
      description: 'don\'t ask, just use default value',
    },
  };
};

const getParser = () => {
  return yargs
    .usage('Initializing midway project from boilerplate.\nUsage: $0 [dir] --type=simple')
    .options(getParserOptions())
    .alias('h', 'help')
    .version()
    .help();
};

module.exports = { getParser, getParserOptions };
