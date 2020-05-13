import { BasePlugin } from '@midwayjs/fcli-command-core';
import { existsSync } from 'fs';
import { join } from 'path';
import { Test } from './test';

export class TestPlugin extends BasePlugin {
  commands = {
    test: {
      usage: 'Test a Serverless service',
      lifecycleEvents: ['test'],
      options: {
        cov: {
          usage: 'get code coverage report',
          shortcut: 'c',
        },
        watch: {
          usage: 'watch',
          shortcut: 'w',
        },
        reporter: {
          usage: 'set mocha reporter',
          shortcut: 'r',
        },
        file: {
          usage: 'specify a test file',
          shortcut: 'f',
        },
      },
    },
  };

  hooks = {
    'test:test': async () => {
      const servicePath = this.core.config.servicePath;
      let testFiles = [];
      if (this.options.f) {
        testFiles = [this.options.f];
        this.core.cli.log(`Testing ${this.options.f}`);
      } else {
        this.core.cli.log('Testing all *.test.js/ts...');
      }
      const options = this.options;
      const tester = new Test();
      await tester.run({
        cwd: servicePath,
        env: process.env,
        argv: Object.assign(process.argv, {
          _: testFiles,
          cov: this.options.cov,
          nyc: '--reporter=json --reporter=lcov --reporter=text',
          watch: options.watch,
          extension: 'ts,js',
          reporter: options.reporter,
          typescript: existsSync(join(servicePath, 'tsconfig.json')),
        }),
        execArgv: process.execArgv,
      });
    },
  };
}
