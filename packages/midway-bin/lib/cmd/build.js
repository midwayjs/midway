'use strict';

const Command = require('egg-bin').Command;
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const fse = require('fs-extra');
const globby = require('globby');

class BuildCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: midway-bin build [options]';

    this.options = {
      clean: {
        description: 'clean build target dir',
        type: 'boolean',
        alias: 'c',
      },
      project: {
        description: 'project file location',
        type: 'string',
        alias: 'p',
        default: 'tsconfig.json',
      },
    };
  }

  get description() {
    return 'build application automatically';
  }

  * run(context) {
    const { cwd, argv } = context;

    const tscCli = require.resolve('typescript/bin/tsc');
    if (!fs.existsSync(path.join(cwd, argv.project))) {
      console.log(`[midway-bin] tsconfig.json not found in ${cwd}\n`);
      return;
    }

    if (argv.clean) {
      yield this.cleanDir(cwd, argv.project);
    }

    yield this.copyFiles(cwd, argv.project);

    const args = [];

    if (argv.project) {
      args.push('-p');
      args.push(argv.project);
    }
    yield this.helper.forkNode(tscCli, args, { cwd });
  }

  * cleanDir(cwd, projectFile) {
    const tsConfig = require(path.join(cwd, projectFile));

    // if projectFile extended and without outDir,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions.outDir)
      ) {
        yield this.cleanDir(cwd, tsConfig.extends);
        return;
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      const outDir = tsConfig.compilerOptions.outDir;
      if (outDir) {
        yield rimraf(outDir);
      }
    }
  }

  * copyFiles(cwd, projectFile) {
    const tsConfig = require(path.join(cwd, projectFile));

    // if projectFile extended and without outDir,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions.outDir)
      ) {
        yield this.copyFiles(cwd, tsConfig.extends);
        return;
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      const outDir = tsConfig.compilerOptions.outDir;
      if (outDir && fs.existsSync(path.join(cwd, 'package.json'))) {
        const pkg = require(path.join(cwd, 'package.json'));
        if (pkg['midway-bin-build'] && pkg['midway-bin-build'].include) {
          for (const file of pkg['midway-bin-build'].include) {
            if (typeof file === 'string' && !/\*/.test(file)) {
              const srcDir = path.join('src', file);
              const targetDir = path.join(outDir, file);
              // 目录，或者不含通配符的普通文件
              this.copyFile(srcDir, targetDir, cwd);
            } else {
              // 通配符的情况
              const paths = yield globby([].concat(file), { cwd: path.join(cwd, 'src') });
              for (const p of paths) {
                this.copyFile(path.join('src', p), path.join(outDir, p), cwd);
              }
            }
          }
        }
      }
    }
  }

  copyFile(srcFile, targetFile, cwd) {
    fse.copySync(path.join(cwd, srcFile), path.join(cwd, targetFile));
    console.log(`[midway-bin] copy ${srcFile} to ${targetFile} success!`);
  }
}

module.exports = BuildCommand;
