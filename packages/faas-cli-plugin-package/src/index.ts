import {
  BasePlugin,
  getSpecFile,
  writeToSpec,
} from '@midwayjs/fcli-command-core';
import { isAbsolute, join, relative, resolve } from 'path';
import {
  copy,
  createWriteStream,
  ensureDir,
  ensureFile,
  existsSync,
  move,
  readFileSync,
  remove,
  statSync,
  writeFileSync,
  writeJSON,
} from 'fs-extra';
import * as micromatch from 'micromatch';
import { commonPrefix, formatLayers } from './utils';
import { analysis, copyFiles } from '@midwayjs/faas-code-analysis';
import { compileInProject, MwccConfig } from '@midwayjs/mwcc';
import { exec } from 'child_process';
import * as archiver from 'archiver';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import { tmpdir } from 'os';

export class PackagePlugin extends BasePlugin {
  options: any;
  servicePath = this.core.config.servicePath;
  // 代表构建产物的路径，非 ts 构建路径
  midwayBuildPath = (this.core.config.buildPath = join(
    this.servicePath,
    '.serverless'
  ));
  defaultTmpFaaSOut = resolve(this.midwayBuildPath, 'faas_tem_out');
  codeAnalyzeResult: AnalyzeResult;
  integrationDistTempDirectory = 'integration_dist'; // 一体化构建的临时目录
  zipCodeDefaultName = 'serverless.zip';
  mwccHintConfig: MwccConfig = {};

  commands = {
    package: {
      usage: 'Packages a Serverless service',
      lifecycleEvents: [
        'cleanup', // 清理构建目录
        'installDevDep', // 安装开发期依赖
        'copyFile', // 拷贝文件: package.include 和 shared content
        'codeAnalysis', // 代码分析
        'tscompile', // 编译函数  'package:after:tscompile'
        'checkAggregation', // 检测高密度部署
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
        sharedDir: {
          usage:
            'Shared directory relative path, default is undefined，package command will copy content to build directory root',
        },
        sharedTargetDir: {
          usage: 'Where the shared directory will be copied, default is static',
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
    'package:codeAnalysis': this.codeAnalysis.bind(this),
    'package:installLayer': this.installLayer.bind(this),
    'package:installDep': this.installDep.bind(this),
    'package:checkAggregation': this.checkAggregation.bind(this),
    'package:package': this.package.bind(this),
    'after:package:generateEntry': this.defaultGenerateEntry.bind(this),
    'before:package:finalize': this.finalize.bind(this),
    'package:tscompile': this.tsCompile.bind(this),
  };

  async cleanup() {
    if (!this.core.config.specFile) {
      this.core.config.specFile = getSpecFile(this.servicePath);
    }
    process.chdir(this.servicePath);
    // 修改构建目标目录
    if (this.options.buildDir) {
      this.options.buildDir = this.transformToRelative(
        this.servicePath,
        this.options.buildDir
      );
      this.core.config.buildPath = join(
        this.servicePath,
        this.options.buildDir,
        '.serverless'
      );
      this.midwayBuildPath = this.core.config.buildPath;
    }

    if (this.options.sourceDir) {
      this.options.sourceDir = this.transformToRelative(
        this.servicePath,
        this.options.sourceDir
      );
    }
    // 分析目录结构
    const locator = new Locator(this.servicePath);
    this.codeAnalyzeResult = await locator.run({
      tsCodeRoot:
        this.options.sourceDir &&
        join(this.servicePath, this.options.sourceDir),
    });
    this.setStore('codeAnalyzeResult', this.codeAnalyzeResult);
    this.core.debug('codeAnalyzeResult', this.codeAnalyzeResult);
    this.core.cli.log('Information');
    this.core.cli.log(` - BaseDir: ${this.servicePath}`);
    this.core.cli.log(' - AnalyzeResult');
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
        this.core.cli.log('   ◎ TSBuildTemporaryRoot: dist');
      }
      // 输出构建产物根路径
      this.core.cli.log(
        `   ◎ PackageRoot: ${relative(this.servicePath, this.midwayBuildPath)}`
      );
    }
    await remove(this.midwayBuildPath);
    await ensureDir(this.midwayBuildPath);
    this.setStore('defaultTmpFaaSOut', this.defaultTmpFaaSOut);
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
    await copyFiles({
      sourceDir: this.servicePath,
      targetDir: this.midwayBuildPath,
      include: [this.options.sourceDir || 'src'].concat(
        packageObj.include || []
      ),
      exclude: packageObj.exclude,
      log: path => {
        this.core.cli.log(`   ◎ Copy ${path}`);
      },
    });
    if (this.codeAnalyzeResult.integrationProject) {
      await writeJSON(join(this.midwayBuildPath, 'package.json'), {
        name: this.codeAnalyzeResult.projectType,
        version: '1.0.0',
        dependencies: this.codeAnalyzeResult.usingDependenciesVersion.valid,
      });
    }
    if (this.options.sharedDir) {
      this.options.sharedTargetDir = this.options.sharedTargetDir || 'static';
      this.core.cli.log(
        ` - Copy Shared Files to build directory(${this.options.sharedTargetDir})...`
      );
      this.options.sharedDir = this.transformToAbsolute(
        this.servicePath,
        this.options.sharedDir
      );
      this.options.sharedTargetDir = this.transformToAbsolute(
        this.midwayBuildPath,
        this.options.sharedTargetDir
      );
      console.log(this.options.sharedTargetDir);
      await copy(this.options.sharedDir, this.options.sharedTargetDir);
    }
    this.core.cli.log(' - File copy complete');
  }

  async installLayer() {
    this.core.cli.log('Install layers...');
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
    this.core.cli.log(' - Layers install complete');
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
    } catch (e) {
      /** ignore */
    }
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
    this.core.cli.log(' - Dependencies install complete');
  }

  async codeAnalysis() {
    if (this.core.service.functions) {
      return this.core.service.functions;
    }
    const newSpec: any = await analysis([
      resolve(this.servicePath, this.codeAnalyzeResult.tsCodeRoot),
      resolve(this.defaultTmpFaaSOut, 'src'),
    ]);
    this.core.debug('CcdeAnalysis', newSpec);
    this.core.service.functions = newSpec.functions;
  }

  async tsCompile() {
    const isTsDir = existsSync(join(this.servicePath, 'tsconfig.json'));
    this.core.cli.log('Building Midway FaaS directory files...');
    if (!isTsDir) {
      this.core.cli.log(' - Not found tsconfig.json and skip build');
      return;
    }
    this.core.cli.log(' - Using tradition build mode');
    await compileInProject(
      this.servicePath,
      join(this.midwayBuildPath, 'dist'),
      this.mwccHintConfig,
      {
        compilerOptions: {
          sourceRoot: '../src',
          rootDir: this.codeAnalyzeResult.tsCodeRoot,
        },
        include: [this.codeAnalyzeResult.tsCodeRoot],
      }
    );
    const tmpOutDir = resolve(this.defaultTmpFaaSOut, 'src');
    if (existsSync(tmpOutDir)) {
      await compileInProject(
        this.servicePath,
        join(this.midwayBuildPath, 'dist'),
        this.mwccHintConfig,
        {
          compilerOptions: { rootDir: tmpOutDir },
          include: [tmpOutDir],
        }
      );
    }
    this.core.cli.log(' - Build Midway FaaS complete');
  }

  // 生成默认入口
  async defaultGenerateEntry() {
    const functions = this.core.service.functions || {};
    for (const func in functions) {
      const handlerConf = functions[func];
      if (handlerConf._ignore) {
        continue;
      }
      const [handlerFileName] = handlerConf.handler.split('.');
      const othEnterFile = [
        join(this.defaultTmpFaaSOut, handlerFileName + '.js'),
        join(this.core.config.servicePath, handlerFileName + '.js'),
      ].find(file => existsSync(file));
      if (othEnterFile) {
        const fileName = join(this.midwayBuildPath, `${handlerFileName}.js`);
        await copy(othEnterFile, fileName);
        this.core.debug('Use user entry', othEnterFile);
      }
    }
    if (existsSync(this.defaultTmpFaaSOut)) {
      this.core.debug('Tmp Out Dir Removed');
      await remove(this.defaultTmpFaaSOut);
    }
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
      output.on('close', () => {
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
      const registry = this.options.registry
        ? ` --registry=${this.options.registry}`
        : '';
      exec(
        `${this.options.npm || 'npm'} install ${
          options.npmList
            ? `${options.npmList.join(' ')}`
            : options.production
            ? '--production'
            : ''
        }${registry}`,
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

  private transformToRelative(baseDir, targetDir) {
    if (targetDir) {
      if (isAbsolute(targetDir)) {
        return relative(baseDir, targetDir);
      }
      return targetDir;
    }
  }

  private transformToAbsolute(baseDir, targetDir) {
    if (targetDir) {
      if (!isAbsolute(targetDir)) {
        return join(baseDir, targetDir);
      }
      return targetDir;
    }
  }

  // 合并高密度部署
  async checkAggregation() {
    // 只在部署阶段生效
    const commands = this.core.processedInput.commands;
    if (
      !commands ||
      !commands.length ||
      (commands[0] !== 'deploy' && commands[0] !== 'package')
    ) {
      return;
    }
    if (!this.core.service.aggregation || !this.core.service.functions) {
      return;
    }

    // if (
    //   !this.core.service.custom ||
    //   !this.core.service.custom.customDomain ||
    //   !this.core.service.custom.customDomain.domainName
    // ) {
    //   console.warn(
    //     'If using aggregation deploy, it is best to configure custom domain'
    //   );
    // }

    this.core.cli.log('Aggregation Deploy');

    // use picomatch to match url
    if (!this.core.service.globalDependencies) {
      this.core.service.globalDependencies = {};
    }
    this.core.service.globalDependencies['picomatch'] = '*';
    const allAggregationPaths = [];
    let allFuncNames = Object.keys(this.core.service.functions);
    for (const aggregationName in this.core.service.aggregation) {
      const aggregationConfig = this.core.service.aggregation[aggregationName];
      const aggregationFuncName = this.getAggregationFunName(aggregationName);
      this.core.service.functions[aggregationFuncName] = aggregationConfig;
      this.core.service.functions[
        aggregationFuncName
      ].handler = `${aggregationFuncName}.handler`;
      this.core.service.functions[aggregationFuncName]._isAggregation = true;
      if (!this.core.service.functions[aggregationFuncName].events) {
        this.core.service.functions[aggregationFuncName].events = [];
      }
      // 忽略原始方法，不再单独进行部署
      const deployOrigin = aggregationConfig.deployOrigin;

      const allAggred = [];
      let handlers = [];

      if (aggregationConfig.functions || aggregationConfig.functionsPattern) {
        const matchedFuncName = [];
        const notMatchedFuncName = [];
        for (const functionName of allFuncNames) {
          let isMatch = false;
          if (aggregationConfig.functions) {
            isMatch = aggregationConfig.functions.indexOf(functionName) !== -1;
          } else if (aggregationConfig.functionsPattern) {
            isMatch = micromatch.all(
              functionName,
              aggregationConfig.functionsPattern
            );
          }
          if (isMatch) {
            matchedFuncName.push(functionName);
          } else {
            notMatchedFuncName.push(functionName);
          }
        }
        allFuncNames = notMatchedFuncName;

        handlers = matchedFuncName
          .map((functionName: string) => {
            const functions = this.core.service.functions;
            const func = functions[functionName];
            if (!func || !func.events) {
              return;
            }
            const httpEventIndex = func.events.findIndex(
              (event: any) => !!event.http
            );
            if (httpEventIndex === -1) {
              return;
            }
            const httpEvent = func.events[httpEventIndex];
            if (!httpEvent || !httpEvent.http.path) {
              return;
            }
            allAggred.push({
              path: httpEvent.http.path,
              method: httpEvent.http.method,
            });
            if (!deployOrigin) {
              // 不把原有的函数进行部署
              this.core.cli.log(
                ` - using function '${aggregationName}' to deploy '${functionName}'`
              );
              delete this.core.service.functions[functionName];
            }
            return {
              path: httpEvent.http.path,
              handler: func.handler,
            };
          })
          .filter((func: any) => !!func);
      }

      const allPaths = allAggred.map(aggre => aggre.path);
      let currentPath = commonPrefix(allPaths);
      currentPath =
        currentPath && currentPath !== '/' ? `${currentPath}/*` : '/*';
      this.core.cli.log(
        ` - using path '${currentPath}' to deploy '${allPaths.join("', '")}'`
      );
      if (allAggregationPaths.indexOf(currentPath) !== -1) {
        console.error(
          `Cannot use the same prefix '${currentPath}' for aggregation deployment`
        );
        process.exit();
      }
      allAggregationPaths.push(currentPath);
      this.core.service.functions[aggregationFuncName]._handlers = handlers;
      this.core.service.functions[aggregationFuncName]._allAggred = allAggred;
      this.core.service.functions[aggregationFuncName].events = [
        { http: { method: 'any', path: currentPath } },
      ];
    }

    const tmpSpecFile = resolve(tmpdir(), `aggre-${Date.now()}/f.yml`);
    await ensureFile(tmpSpecFile);

    this.core.config.specFile.path = tmpSpecFile;
    writeToSpec(this.servicePath, this.core.service, this.core.config.specFile);
  }

  getAggregationFunName(aggregationName: string) {
    return aggregationName;
  }

  finalize() {}
}
