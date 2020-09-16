'use strict';

const Command = require('egg-bin').Command;

class DocCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin doc [options]';

    this.options = {
      out: {
        description:
          'Specifies the location the documentation should be written to.',
        type: 'string',
        default: 'doc',
        alias: 'o',
      },
      mode: {
        description:
          'Specifies the output mode the project is used to be compiled with.',
        type: 'string',
        default: 'file',
        alias: 'm',
      },
      options: {
        description:
          'Specify a js option file that should be loaded. If not specified TypeDoc will look for ‘typedoc.json’ in the current directory.',
        type: 'string',
      },
      exclude: {
        description:
          'Exclude files by the given pattern when a path is provided as source.',
        type: 'string',
      },
      theme: {
        description: 'Specify the path to the theme that should be used.',
        type: 'string',
        default: 'default',
      },
      excludeExternals: {
        description:
          'Prevent externally resolved TypeScript files from being documented.',
        type: 'boolean',
        default: true,
      },
      ignoreCompilerErrors: {
        description:
          'Generates documentation, even if the project does not TypeScript compile.',
        type: 'boolean',
        default: true,
      },
      hideGenerator: {
        description: 'Do not print the TypeDoc link at the end of the page.',
        type: 'boolean',
        default: true,
      },
    };
  }

  get description() {
    return 'generate typescript document by typedoc';
  }

  async run({ cwd, argv }) {
    let args;
    if (argv.options) {
      // if has options args just ignore others
      args = ['--options', argv.options];
    } else {
      args = this.helper.unparseArgv(argv, {
        allowCamelCase: true,
        useEquals: false,
      });
      args = args.filter(item => {
        return !/--\w+-\w+/.test(item);
      });
    }

    const docBin = require.resolve('typedoc/bin/typedoc');
    await this.helper.forkNode(docBin, args, { cwd, execArgv: [] });
  }
}

module.exports = DocCommand;
