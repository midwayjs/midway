'use strict';

const Command = require('egg-bin').Command;
const path = require('path');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const fse = require('fs-extra');
const globby = require('globby');
const ncc = require('@midwayjs/ncc');
const terser = require('terser');
let typescript;

const shebangRegEx = /^#![^\n\r]*[\r\n]/;
const inlineSourceMapRegEx = /\/\/# sourceMappingURL=data:application\/json;base64,(.*)/;

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
      minify: {
        type: 'boolean',
      },
      mode: {
        description: 'bundle mode, "debug" or "release" (default)',
        type: 'string',
        default: 'release',
      },
      tsConfig: {
        description: 'tsConfig json object data',
        type: 'object',
      },
    };
  }

  get description() {
    return 'build application automatically';
  }

  async run(context) {
    const { cwd, argv } = context;

    const tscCli = require.resolve('typescript/bin/tsc');
    const projectFile = path.join(cwd, argv.project || '');
    if (typeof argv.tsConfig === 'string') {
      try {
        argv.tsConfig = JSON.parse(argv.tsConfig);
      } catch (e) {
        console.log(`[midway-bin] tsConfig should be JSON string or Object: ${e.message}\n`);
        return;
      }
    }
    if (!argv.tsConfig && !fs.existsSync(projectFile)) {
      console.log(`[midway-bin] tsconfig.json not found in ${cwd}\n`);
      return;
    }
    const tsConfig = argv.tsConfig || require(projectFile);
    const projectDir = this.projectDir = path.dirname(projectFile);
    let outDir = this.inferCompilerOptions(tsConfig, 'outDir');
    let outDirAbsolute;
    if (outDir) {
      outDir = path.resolve(projectDir, outDir);
      outDir = path.relative(projectDir, outDir);
      outDirAbsolute = path.join(projectDir, outDir);
    }

    if (argv.clean) {
      await this.cleanDir(outDirAbsolute);
    }

    await this.copyFiles(projectDir, outDir, argv);

    if (argv.mode !== 'release') {
      argv.mode = 'debug';
    }
    if (argv.entrypoint) {
      outDir = outDirAbsolute || path.resolve(projectDir, 'dist');
      await this.bundle(path.resolve(cwd, argv.entrypoint), outDir,
        {
          sourceMap: this.inferCompilerOptions(tsConfig, 'sourceMap', { projectDir }),
          mode: argv.mode,
        });
      return;
    }

    const args = [];

    if (argv.project) {
      args.push('-p');
      args.push(argv.project);
    } else if (argv.tsConfig) {
      await this.tsCfg2CliArgs(cwd, argv, args);
    }
    await this.helper.forkNode(tscCli, args, { cwd, execArgv: [] });

    if (argv.minify) {
      await this.minify(tsConfig, outDirAbsolute);
    }
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
      sourceMapBasePrefix: path.relative(outDir, process.cwd()) + '/',
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

  async copyFiles(from, outDir, argv) {
    if (outDir && fs.existsSync(path.join(from, 'package.json'))) {
      const pkg = require(path.join(from, 'package.json'));
      if (pkg['midway-bin-build'] && pkg['midway-bin-build'].include) {
        for (const file of pkg['midway-bin-build'].include) {
          if (typeof file === 'string' && !/\*/.test(file)) {
            const srcDir = path.join(argv.srcDir, file);
            const targetDir = path.join(outDir, file);
            // 目录，或者不含通配符的普通文件
            this.copyFile(srcDir, targetDir, from);
          } else {
            // 通配符的情况
            const paths = await globby([].concat(file), {
              cwd: path.join(from, argv.srcDir),
            });
            for (const p of paths) {
              this.copyFile(
                path.join(argv.srcDir, p),
                path.join(outDir, p),
                from
              );
            }
          }
        }
      }
    }
  }

  copyFile(srcFile, targetFile, from) {
    if (!fs.existsSync(srcFile)) {
      console.warn(`[midway-bin] can't find ${srcFile} and skip it`);
    } else {
      fse.copySync(path.join(from, srcFile), path.join(from, targetFile));
      console.log(`[midway-bin] copy ${srcFile} to ${targetFile} success!`);
    }
  }

  inferCompilerOptions(tsConfig, optionKeyPath, { projectDir = process.cwd() } = {}) {
    // if projectFile extended and without the option,
    // get setting from its parent
    if (tsConfig && tsConfig.extends) {
      if (
        !tsConfig.compilerOptions ||
        (tsConfig.compilerOptions && !tsConfig.compilerOptions[optionKeyPath])
      ) {
        return this.inferCompilerOptions(require(path.join(projectDir, tsConfig.extends)), optionKeyPath, { projectDir });
      }
    }

    if (tsConfig && tsConfig.compilerOptions) {
      return tsConfig.compilerOptions[optionKeyPath];
    }
  }

  async minify(tsConfig, outDir) {
    if (typescript == null) {
      typescript = require('typescript');
    }

    const inlineSourceMap = !!tsConfig.compilerOptions.inlineSourceMap;
    const sourceMap = inlineSourceMap || tsConfig.compilerOptions.sourceMap;
    if (!sourceMap) {
      return;
    }

    let files;
    if (outDir) {
      files = globby.sync([ '**/*.js' ], {
        cwd: outDir,
        ignore: [ '**/node_modules' ],
      });
      files = files.map(it => path.join(outDir, it));
    } else {
      const host = typescript.createCompilerHost(tsConfig.compilerOptions);
      files = host.readDirectory(__dirname, [ '.ts' ], tsConfig.exclude, tsConfig.include);
      files = files.map(it => {
        return path.join(path.dirname(it), path.basename(it, '.js'));
      });
    }

    for (const file of files) {
      let code = await fse.readFile(file, 'utf8');
      let map;
      if (inlineSourceMap) {
        map = this.parseInlineSourceMap(code);
      } else {
        map = await fse.readFile(file + '.map', 'utf8');
      }
      map = JSON.parse(map);
      const result = terser.minify(code, {
        compress: false,
        mangle: {
          keep_classnames: true,
          keep_fnames: true,
        },
        sourceMap: {
          content: map,
          filename: path.basename(file),
          url: inlineSourceMap ? 'inline' : `${path.basename(file)}.map`,
        },
      });
      ({ code, map } = result);
      if (code == null) {
        break;
      }
      if (!inlineSourceMap) {
        await fse.writeFile(file + '.map', map, 'utf8');
      }
      await fse.writeFile(file, code, 'utf8');
    }
  }

  parseInlineSourceMap(code) {
    const match = inlineSourceMapRegEx.exec(code);
    if (match == null) {
      return;
    }
    const map = Buffer.from(match[1], 'base64').toString('utf8');
    return map;
  }

  async tsCfg2CliArgs(cwd, argv, args) {
    const cfg = argv.tsConfig;
    // https://www.typescriptlang.org/docs/handbook/tsconfig-json.html
    /**
     * include & exclude
     */
    const files = await globby(
      [].concat(
        cfg.files || [],
        cfg.include ? cfg.include : 'src/**/*', // include
        (cfg.exclude || []).map(str => '!' + str) // exclude
      ),
      { cwd }
    );
    for (const item of files) {
      if (/\.tsx?$/.test(file)) {
        args.push(item);
      }
    }

    /**
     * compilerOptions
     */
    for (const key in cfg.compilerOptions || {}) {
      if (cfg.compilerOptions[key] === true || cfg.compilerOptions[key] === 'true') {
        args.push(`--${key}`);
      } else {
        args.push(`--${key}`);
        args.push(cfg.compilerOptions[key]);
      }
    }
  }
}

module.exports = BuildCommand;
