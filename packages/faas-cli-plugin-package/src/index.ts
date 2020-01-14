import { BasePlugin } from '@midwayjs/fcli-command-core';
import { join, relative, resolve, isAbsolute } from 'path';
import {
  copy,
  createWriteStream,
  ensureDir,
  existsSync,
  readFileSync,
  remove,
  statSync,
  writeFileSync,
  writeJSON,
  move,
  ensureFile,
} from 'fs-extra';
import * as globby from 'globby';
import { formatLayers } from './utils';
import { BuildCommand } from 'midway-bin';
import { exec } from 'child_process';
import * as archiver from 'archiver';
import { AnalyzeResult, Locator } from '@midwayjs/locate';

export class PackagePlugin extends BasePlugin {
  core: any;
  options: any;
  servicePath = this.core.config.servicePath;
  // 代表构建产物的路径，非 ts 构建路径
  midwayBuildPath = (this.core.config.buildPath = join(
    this.servicePath,
    '.serverless'
  ));
  codeAnalyzeResult: AnalyzeResult;
  integrationDistTempDirectory = 'integration_dist'; // 一体化构建的临时目录
  zipCodeDefaultName = 'serverless.zip';

  commands = {
    package: {
      usage: 'Packages a Serverless service',
      lifecycleEvents: [
        'cleanup', // 清理构建目录
        'installDevDep', // 安装开发期依赖
        'copyFile', // 拷贝文件: package.include
        'tscompile', // 编译函数  'package:after:tscompile'
        'generateSpec', // 生成对应平台的描述文件，例如 serverless.yml 等
        'generateEntry', // 生成对应平台的入口文件
        'installLayer', // 安装layer
        'installDep', // 安装依赖
        'package', // 函数打包
        'finalize', // 完成
      ],
      // 暂无
      options: {
        npm: {
          usage: 'NPM client name',
        },
        buildDir: {
          usage: 'Build relative path, default is process.cwd()',
        },
        sourceDir: {
          usage: 'Source relative path, default is src',
        },
        skipZip: {
          usage: 'Skip zip artifact',
          shortcut: 'z',
        },
        stage: {
          usage: 'Stage of the service',
          shortcut: 's',
        },
        resolve: {
          usage: 'Resolve layer versions and lock them in final archive',
          shortcut: 'r',
        },
      },
    },
  };

  hooks = {
    'package:cleanup': this.cleanup.bind(this),
    'package:installDevDep': this.installDevDep.bind(this),
    'package:copyFile': this.copyFile.bind(this),
    'package:installLayer': this.installLayer.bind(this),
    'package:installDep': this.installDep.bind(this),
    'package:package': this.package.bind(this),
    'package:tscompile': this.tsCompile.bind(this),
  };

  async cleanup() {
    process.chdir(this.servicePath);
    // 修改构建目标目录
    if (this.options.buildDir) {
      this.core.config.buildPath = join(
        this.servicePath,
        this.options.buildDir,
        '.serverless'
      );
      this.midwayBuildPath = this.core.config.buildPath;
    }

    // 分析目录结构
    const locator = new Locator(this.servicePath);
    this.codeAnalyzeResult = await locator.run({
      tsCodeRoot:
        this.options.sourceDir &&
        join(this.servicePath, this.options.sourceDir),
    });
    this.core.cli.log(`Information`);
    this.core.cli.log(` - BaseDir: ${this.servicePath}`);
    this.core.cli.log(` - AnalyzeResult`);
    this.core.cli.log(
      `   ◎ ProjectType: ${this.codeAnalyzeResult.projectType}`
    );
    if (this.codeAnalyzeResult.midwayRoot) {
      // 输出 midway-* 项目根路径
      this.core.cli.log(
        `   ◎ MidwayRoot: ${
          this.servicePath === this.codeAnalyzeResult.midwayRoot
            ? '.'
            : relative(this.servicePath, this.codeAnalyzeResult.midwayRoot)
        }`
      );
      // 输出 ts 代码根路径
      this.core.cli.log(
        `   ◎ TSCodeRoot: ${relative(
          this.servicePath,
          this.codeAnalyzeResult.tsCodeRoot
        )}`
      );
      this.options.sourceDir = relative(
        this.servicePath,
        this.codeAnalyzeResult.tsCodeRoot
      );
      if (this.codeAnalyzeResult.integrationProject) {
        this.core.cli.log(
          `   ◎ TSBuildTemporaryRoot: ${this.integrationDistTempDirectory}`
        );
        await remove(join(this.servicePath, this.integrationDistTempDirectory));
      } else {
        this.core.cli.log(`   ◎ TSBuildTemporaryRoot: dist`);
      }
      // 输出构建产物根路径
      this.core.cli.log(
        `   ◎ PackageRoot: ${relative(this.servicePath, this.midwayBuildPath)}`
      );
    }
    await remove(this.midwayBuildPath);
    await ensureDir(this.midwayBuildPath);
  }

  async installDevDep() {
    this.core.cli.log('Install development dependencies...');
    if (!existsSync(join(this.servicePath, 'node_modules'))) {
      await this.npmInstall({
        baseDir: this.servicePath,
      });
      this.core.cli.log(' - Install development dependencies complete...');
    } else {
      this.core.cli.log(' - Find node_modules and skip...');
    }
  }

  async copyFile() {
    this.core.cli.log('Copy Files to build directory...');
    // copy packages config files
    const packageObj: any = this.core.service.package || {};
    const include = await globby(
      [this.options.sourceDir || 'src', 'tsconfig.json', 'package.json'].concat(
        packageObj.include || []
      ),
      { cwd: this.servicePath }
    );
    const exclude = await globby(packageObj.exclude || [], {
      cwd: this.servicePath,
    });
    const paths = include.filter((filePath: string) => {
      return exclude.indexOf(filePath) === -1;
    });
    if (paths.length) {
      this.core.cli.log(` - Copy files`);
    }
    await Promise.all(
      paths.map((path: string) => {
        this.core.cli.log(`   ◎ Copy ${path}`);
        return copy(
          join(this.servicePath, path),
          join(this.midwayBuildPath, path)
        );
      })
    );
    if (this.codeAnalyzeResult.integrationProject) {
      await writeJSON(join(this.midwayBuildPath, 'package.json'), {
        name: this.codeAnalyzeResult.projectType,
        version: '1.0.0',
        dependencies: this.codeAnalyzeResult.usingDependenciesVersion.valid,
      });
    }
    this.core.cli.log(` - File copy complete`);
  }

  async installLayer() {
    this.core.cli.log(`Install layers...`);
    const funcLayers = [];
    if (this.core.service.functions) {
      for (const func in this.core.service.functions) {
        const funcConf = this.core.service.functions[func];
        if (funcConf.layers) {
          funcLayers.push(funcConf.layers);
        }
      }
    }
    const layerTypeList = formatLayers(this.core.service.layers, ...funcLayers);
    const npmList = Object.keys(layerTypeList.npm).map(
      (name: string) => layerTypeList.npm[name]
    );
    if (npmList && npmList.length) {
      await this.npmInstall({
        npmList,
      });
    }
    this.core.cli.log(` - Layers install complete`);
  }

  async installDep() {
    this.core.cli.log('Install production dependencies...');
    if (this.options.ncc) {
      this.core.cli.log(' - Production dependencies install skip: using ncc');
      return;
    }
    // globalDependencies
    // pkg.json dependencies
    // pkg.json localDependencies
    const pkgJsonPath: string = join(this.midwayBuildPath, 'package.json');
    let pkgJson: any = {};
    try {
      pkgJson = JSON.parse(readFileSync(pkgJsonPath).toString());
    } catch (e) {}
    const allDependencies = Object.assign(
      {},
      this.core.service.globalDependencies,
      pkgJson.dependencies,
      pkgJson.localDependencies
    );
    pkgJson.dependencies = {};
    const localDep = {};
    for (const depName in allDependencies) {
      const depVersion = allDependencies[depName];
      if (/^(\.|\/)/.test(depVersion)) {
        // local dep
        const depPath = join(this.servicePath, depVersion);
        if (existsSync(depPath)) {
          localDep[depName] = depPath;
        } else {
          this.core.cli.log(` - Local dep ${depName}:${depVersion} not exists`);
        }
      } else {
        pkgJson.dependencies[depName] = depVersion;
      }
    }
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '  '));
    await this.npmInstall({
      production: true,
    });
    for (const localDepName in localDep) {
      const target = join(this.midwayBuildPath, 'node_modules', localDepName);
      await copy(localDep[localDepName], target);
    }
    this.core.cli.log(` - Dependencies install complete`);
  }

  async tsCompile() {
    const isTsDir = existsSync(join(this.servicePath, 'tsconfig.json'));
    this.core.cli.log('Building Midway FaaS directory files...');
    if (!isTsDir) {
      this.core.cli.log(' - Not found tsconfig.json and skip build');
      return;
    }
    if (this.options.ncc) {
      this.core.cli.log(' - Using single file build mode');
      // await buildByNcc();
    } else {
      this.core.cli.log(' - Using tradition build mode');
      const builder = new BuildCommand();
      const source = this.options.sourceDir || 'src';
      if (this.codeAnalyzeResult.integrationProject) {
        const tsFaaSConfigFilename = 'tsconfig_integration_faas.json';
        // 生成一个临时 tsconfig
        const tempConfigFilePath = join(this.servicePath, tsFaaSConfigFilename);
        await remove(tempConfigFilePath);
        // 重新写一个新的
        await writeJSON(tempConfigFilePath, {
          compileOnSave: true,
          compilerOptions: {
            target: 'ES2018',
            module: 'commonjs',
            moduleResolution: 'node',
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            inlineSourceMap: true,
            noImplicitThis: true,
            noUnusedLocals: true,
            stripInternal: true,
            pretty: true,
            declaration: true,
            outDir: relative(
              this.servicePath,
              join(this.midwayBuildPath, 'dist')
            ),
          },
          include: [
            `${relative(
              this.servicePath,
              this.codeAnalyzeResult.tsCodeRoot
            )}/**/*`,
          ],
          exclude: ['dist', 'node_modules', 'test'],
        });
        await builder.run({
          cwd: this.servicePath,
          argv: {
            clean: true,
            project: tsFaaSConfigFilename,
            srcDir: source,
          },
        });
        // 把临时的 tsconfig 移动进去
        await move(
          tempConfigFilePath,
          join(this.midwayBuildPath, 'tsconfig.json'),
          {
            overwrite: true,
          }
        );
      } else {
        await builder.run({
          cwd: this.servicePath,
          argv: {
            clean: true,
            project: 'tsconfig.json',
            srcDir: source,
          },
        });
        // copy dist to artifact directory
        await move(
          this.codeAnalyzeResult.tsBuildRoot,
          join(this.midwayBuildPath, 'dist'),
          {
            overwrite: true,
          }
        );
      }
    }
    this.core.cli.log(` - Build Midway FaaS complete`);
  }

  async package() {
    this.core.cli.log('Package artifact...');
    // 跳过打包
    if (this.options.skipZip) {
      this.core.cli.log(' - Zip artifact skip');
      return;
    }
    // 构建打包
    const packageObj: any = this.core.service.package || {};

    let file = join(this.servicePath, this.zipCodeDefaultName);

    if (packageObj.artifact) {
      if (isAbsolute(packageObj.artifact)) {
        file = packageObj.artifact;
      } else {
        file = join(this.servicePath, packageObj.artifact);
      }
    }

    this.core.cli.log(` - Artifact file ${relative(this.servicePath, file)}`);

    // 保证文件存在，然后删了文件，只留目录
    await ensureFile(file);
    await remove(file);

    await this.makeZip(this.midwayBuildPath, file);
    const stat = statSync(file);
    this.core.cli.log(
      ` - Zip size ${Number(stat.size / (1024 * 1024)).toFixed(2)}MB`
    );
    if (this.options.package) {
      const to = resolve(this.servicePath, this.options.package);
      await move(file, to);
    }
  }

  private makeZip(sourceDirection: string, targetFileName: string) {
    return new Promise(resolve => {
      const output = createWriteStream(targetFileName);
      output.on('close', function() {
        resolve(archive.pointer());
      });
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      archive.pipe(output);
      archive.directory(sourceDirection, false);
      archive.finalize();
    });
  }

  // 安装npm到构建文件夹
  private async npmInstall(
    options: {
      npmList?: string[];
      baseDir?: string;
      production?: boolean;
    } = {}
  ) {
    return new Promise((resolve, reject) => {
      const installDirectory = options.baseDir || this.midwayBuildPath;
      const pkgJson: string = join(installDirectory, 'package.json');
      if (!existsSync(pkgJson)) {
        writeFileSync(pkgJson, '{}');
      }
      exec(
        `${this.options.npm || 'npm'} install ${
          options.npmList
            ? `${options.npmList.join(' ')}`
            : options.production
            ? '--production'
            : ''
        }`,
        { cwd: installDirectory },
        err => {
          if (err) {
            const errmsg = (err && err.message) || err;
            this.core.cli.log(` - npm install err ${errmsg}`);
            reject(errmsg);
          } else {
            resolve(true);
          }
        }
      );
    });
  }
}
