import { TestCommand, CovCommand } from 'midway-bin';
import * as co from 'co';
import { CommandBase, ICommand, IHooks } from '../../core/commandBase';
import { existsSync } from 'fs';
import { join } from 'path';

export class Test extends CommandBase {

  serverless: any;
  servicePath: string;

  getCommand(): ICommand {
    return {
      test: {
        usage: 'Test a Serverless service',
        lifecycleEvents: [
          'test',
        ],
        options: {
          cov: {
            usage: 'get code coverage report',
            shortcut: 'c'
          },
          watch: {
            usage: 'watch',
            shortcut: 'w'
          },
          reporter: {
            usage: 'set mocha reporter',
            shortcut: 'r'
          }
        },
      },
    };
  }

  getHooks(): IHooks {
    return {
      'test:test': async () => {
        this.serverless.cli.log('Testing all *.test.js/ts...');
        const options = this.options;
        const Command = options.cov ? CovCommand : TestCommand;
        const servicePath = this.servicePath;
        const tester = new Command();
        await co(function* () {
          process.env.TS_NODE_FILES = 'true';
          yield tester.run({
            cwd: servicePath,
            env: process.env,
            argv: Object.assign(process.argv, {
              _: [],
              nyc: '--reporter=json --reporter=lcov --reporter=text',
              watch: options.watch,
              extension: 'ts,js',
              reporter: options.reporter,
              typescript: existsSync(join(servicePath, 'tsconfig.json'))
            }),
            execArgv: process.execArgv
          });
        });
      }
    };
  }
}
