'use strict';

const Command = require('egg-bin').Command;
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const fse = require('fs-extra');
const globby = require('globby');
const ncc = require('@zeit/ncc');

const shebangRegEx = /^#![^\n\r]*[\r\n]/;

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
      entrypoint: {
        description: 'bundle the source with the file given as entrypoint',
        type: 'string',
        default: '',
      },
      mode: {
        description: 'bundle mode, "debug" or "release" (default)',
        type: 'string',
        default: 'release',
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
    const tsConfig = require(path.join(cwd, argv.project));
    const outDir = this.inferCompilerOptions(tsConfig, 'outDir');

    if (argv.clean) {
      await this.cleanDir(outDir);
    }

    await this.copyFiles(cwd, outDir, argv);

    if (argv.mode !== 'release') {
      argv.mode = 'debug';
    }
    if (argv.entrypoint) {
      await this.bundle(path.resolve(cwd, argv.entrypoint), outDir,
        {
          sourceMap: this.inferCompilerOptions(tsConfig, 'sourceMap'),
          mode: argv.mode,
        });
      return;
    }

    const args = [];

    if (argv.project) {
      args.push('-p');
      args.push(argv.project);
    }
    await this.helper.forkNode(tscCli, args, { cwd, execArgv: [] });
  }

  async bundle(entry, outDir, { sourceMap = false, mode } = {}) {
    // Assets is an object of asset file names to { source, permissions, symlinks }
    // expected relative to the output code (if any)
    const options = {
      // provide a custom cache path or disable caching
      cache: false,
      // externals to leave as requires of the build
      externals: [],
      // directory outside of which never to emit assets
      filterAssetBase: process.cwd(),
      minify: false,
      sourceMap,
      // default treats sources as output-relative
      sourceMapBasePrefix: path.relative(outDir, path.dirname(entry)) + '/',
      // Node.js v12 comes with builtin source map support.
      sourceMapRegister: false,
      watch: false,
      v8cache: false,
      quiet: false,
      debugLog: false,
    };
    if (mode === 'release') {
      options.minify = true;
    }
    const { error, code, map, assets, symlinks } = await ncc(entry, options);

    if (error) {
      console.error(error);
      return;
    }

    outDir = outDir || path.resolve('dist');
    fse.mkdirpSync(outDir);

    let basename = path.basename(entry, '.ts');
    if (!basename.endsWith('.js')) {
      basename += '.js';
    }
    fs.writeFileSync(outDir + '/' + basename, code, { mode: code.match(shebangRegEx) ? 0o777 : 0o666 });
    if (map) fs.writeFileSync(outDir + '/index.js.map', map);

    for (const asset of Object.keys(assets)) {
      const assetPath = outDir + '/' + asset;
      fse.mkdirpSync(path.dirname(assetPath));
      fs.writeFileSync(assetPath, assets[asset].source, { mode: assets[asset].permissions });
    }

    for (const symlink of Object.keys(symlinks)) {
      const symlinkPath = outDir + '/' + symlink;
      fs.symlinkSync(symlinks[symlink], symlinkPath);
    }
  }

  async cleanDir(dir) {
    if (dir) {
      await rimraf(dir);
    }
  }

  async copyFiles(cwd, outDir, argv) {
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

  copyFile(srcFile, targetFile, cwd) {
    if (!fs.existsSync(srcFile)) {
      console.warn(`[midway-bin] can't find ${srcFile} and skip it`);
    } else {
      fse.copySync(path.join(cwd, srcFile), path.join(cwd, targetFile));
      console.log(`[midway-bin] copy ${srcFile} to ${targetFile} success!`);
    }
  }

  inferCompilerOptions(tsConfig, option) {
    // if projectFile extended and without the option,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions[option])
      ) {
        return this.inferCompilerOptions(require(path.join(process.cwd(), tsConfig.extends)), option);
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      return tsConfig.compilerOptions[option];
    }
  }
}

module.exports = BuildCommand;
