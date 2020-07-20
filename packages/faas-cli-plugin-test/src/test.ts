import { fork } from 'child_process';
import * as globby from 'globby';
import { join } from 'path';
import { existsSync, remove } from 'fs-extra';
export class Test {
  config: any;
  argv: any;
  public async run(config) {
    this.config = config;
    this.argv = config.argv;
    const execArgv = this.argv.execArgv || [];

    // if cov need not exists report dir
    if (this.argv.cov) {
      const coverageDir = join(this.config.cwd, 'coverage');
      if (existsSync(coverageDir)) {
        await remove(coverageDir);
      }
      const outputDir = join(this.config.cwd, 'node_modules/.nyc_output');
      if (existsSync(outputDir)) {
        await remove(outputDir);
      }
    }
    const opt = {
      cwd: this.config.cwd,
      env: Object.assign(
        {
          NODE_ENV: 'test',
        },
        this.config.env
      ),
      execArgv,
    };

    // exec bin file
    let binFile;
    if (this.argv.cov) {
      binFile = require.resolve('nyc/bin/nyc.js');
    } else {
      binFile = require.resolve('mocha/bin/_mocha');
    }
    const args = await this.formatTestArgs();
    return this.forkNode(binFile, args, opt);
  }

  private async formatTestArgs() {
    const argsPre = [];
    const args = [];
    if (this.argv.typescript) {
      argsPre.push('--require', require.resolve('ts-node/register'));
    }
    if (this.argv.cov) {
      if (this.argv.nyc) {
        argsPre.push(...this.argv.nyc.split(' '));
        argsPre.push('--temp-directory', './node_modules/.nyc_output');
      }
      if (this.argv.typescript) {
        argsPre.push('--extension');
        argsPre.push('.ts');
      }
      argsPre.push(require.resolve('mocha/bin/_mocha'));
    } else if (this.argv.extension) {
      args.push(`--extension=${this.argv.extension}`);
    }
    let timeout = this.argv.timeout || process.env.TEST_TIMEOUT || 60000;
    if (process.env.JB_DEBUG_FILE) {
      // --no-timeout
      timeout = false;
    }
    args.push(timeout ? `--timeout=${timeout}` : '--no-timeout');

    if (this.argv.reporter || process.env.TEST_REPORTER) {
      args.push('--reporter=true');
    }

    args.push('--exit=true');

    const requireArr = [].concat(this.argv.require || this.argv.r || []);

    if (!this.argv.fullTrace) {
      requireArr.unshift(require.resolve('./mocha-clean'));
    }

    requireArr.forEach(requireItem => {
      args.push(`--require=${requireItem}`);
    });

    let pattern;

    if (!pattern) {
      // specific test files
      pattern = this.argv._.slice();
    }
    if (!pattern.length && process.env.TESTS) {
      pattern = process.env.TESTS.split(',');
    }

    if (!pattern.length) {
      pattern = [`test/**/*.test.${this.argv.typescript ? 'ts' : 'js'}`];
    }
    pattern = pattern.concat(['!test/fixtures', '!test/node_modules']);

    const files = globby.sync(pattern);

    if (files.length === 0) {
      console.log(`No test files found with ${pattern}`);
      return;
    }

    args.push(...files);

    // auto add setup file as the first test file
    const setupFile = join(
      process.cwd(),
      `test/.setup.${this.argv.typescript ? 'ts' : 'js'}`
    );
    if (existsSync(setupFile)) {
      args.unshift(setupFile);
    }
    return argsPre.concat(args);
  }

  protected forkNode(modulePath, args = [], options: any = {}) {
    options.stdio = options.stdio || 'inherit';
    const proc: any = fork(modulePath, args, options);
    gracefull(proc);
    return new Promise((resolve, reject) => {
      proc.once('exit', (code: any) => {
        childs.delete(proc);
        if (code !== 0) {
          const err: any = new Error(
            modulePath + ' ' + args + ' exit with code ' + code
          );
          err.code = code;
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

const childs: any = new Set();
let hadHook = false;
function gracefull(proc) {
  // save child ref
  childs.add(proc);

  // only hook once
  /* istanbul ignore else */
  if (!hadHook) {
    hadHook = true;
    let signal;
    ['SIGINT', 'SIGQUIT', 'SIGTERM'].forEach((event: any) => {
      process.once(event, () => {
        signal = event;
        process.exit(0);
      });
    });

    process.once('exit', () => {
      // had test at my-helper.test.js, but coffee can't collect coverage info.
      for (const child of childs) {
        child.kill(signal);
      }
    });
  }
}
