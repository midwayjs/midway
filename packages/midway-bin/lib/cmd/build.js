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
      srcDir: {
        description: 'source code path',
        type: 'string',
        default: 'src',
      },
    };
  }

  get description() {
    return 'build application automatically';
  }

  async run(context) {
    const { cwd, argv } = context;

    const tscCli = require.resolve('typescript/bin/tsc');
    if (!fs.existsSync(path.join(cwd, argv.project))) {
      console.log(`[midway-bin] tsconfig.json not found in ${cwd}\n`);
      return;
    }

    if (argv.clean) {
      await this.cleanDir(cwd, argv.project);
    }

    await this.copyFiles(cwd, argv.project, argv);

    const args = [];

    if (argv.project) {
      args.push('-p');
      args.push(argv.project);
    }
    await this.helper.forkNode(tscCli, args, { cwd });
  }

  async cleanDir(cwd, projectFile) {
    const tsConfig = require(path.join(cwd, projectFile));

    // if projectFile extended and without outDir,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions.outDir)
      ) {
        await this.cleanDir(cwd, tsConfig.extends);
        return;
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      const outDir = tsConfig.compilerOptions.outDir;
      if (outDir) {
        await rimraf(outDir);
      }
    }
  }

  async copyFiles(cwd, projectFile, argv) {
    const tsConfig = require(path.join(cwd, projectFile));

    // if projectFile extended and without outDir,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions.outDir)
      ) {
        await this.copyFiles(cwd, tsConfig.extends, argv);
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
              const srcDir = path.join(argv.srcDir, file);
              const targetDir = path.join(outDir, file);
              // 目录，或者不含通配符的普通文件
              this.copyFile(srcDir, targetDir, cwd);
            } else {
              // 通配符的情况
              const paths = await globby([].concat(file), {
                cwd: path.join(cwd, argv.srcDir),
              });
              for (const p of paths) {
                this.copyFile(
                  path.join(argv.srcDir, p),
                  path.join(outDir, p),
                  cwd
                );
              }
            }
          }
        }
      }
    }
  }

  copyFile(srcFile, targetFile, cwd) {
    if (!fs.existsSync(srcFile)) {
      console.warn(`[midway-bin] can't found ${srcFile} and skip it`);
    } else {
      fse.copySync(path.join(cwd, srcFile), path.join(cwd, targetFile));
      console.log(`[midway-bin] copy ${srcFile} to ${targetFile} success!`);
    }
  }
}

module.exports = BuildCommand;
