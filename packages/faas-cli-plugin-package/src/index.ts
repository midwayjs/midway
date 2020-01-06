import { BasePlugin } from '@midwayjs/fcli-command-core';
import { join, resolve } from 'path';
import { copy, createWriteStream, ensureDir, existsSync, remove, writeFileSync, readFileSync, statSync, unlinkSync } from 'fs-extra';
import * as globby from 'globby';
import { formatLayers } from './utils';
import { BuildCommand } from 'midway-bin';
import { exec } from 'child_process';
import * as archiver from 'archiver';

export class PackagePlugin extends BasePlugin {
  core: any;
  options: any;
  servicePath = this.core.config.servicePath;
  midwayBuildPath = join(this.servicePath, '.serverless');

  commands = {
    package: {
      usage: 'Packages a Serverless service',
      lifecycleEvents: [
        'cleanup',                    // 清理构建目录
        'spec',                       // 生成对应平台的描述文件，例如 serverless.yml 等
        'wrapper',                    // 生成对应平台的入口文件
        'copyFile',                   // 拷贝文件: package.include
        'layerInstall',               // 安装layer
        'depInstall',                 // 安装依赖
        'tscompile',                  // 编译函数  'package:after:tscompile'
        'package',                    // 函数打包
        'finalize',                   // 完成
      ],
      // 暂无
      options: {
        skipClean: {
          usage: 'skip clean'
        },
        npm: {
          usage: 'npm'
        }
      },
    },
  };

  hooks = {
    'package:cleanup': this.cleanup.bind(this),
    'package:copyFile': this.copyFile.bind(this),
    'package:layerInstall': this.layerInstall.bind(this),
    'package:depInstall': this.depInstall.bind(this),
    'package:tscompile': this.tscompile.bind(this),
    'package:package': this.package.bind(this)
  };

  async cleanup() {
    // 跳过清理
    if (!this.options.skipClean) {
      await remove(this.midwayBuildPath);
    }
    await ensureDir(this.midwayBuildPath);
    this.core.cli.log(` - BaseDir: ${this.servicePath}`);
  }

  async copyFile() {
    const packageObj: any = this.core.service.package || {};
    const include = await globby(['src', 'tsconfig.json', 'package.json'].concat(packageObj.include || []), { cwd: this.servicePath });
    const exclude = await globby(packageObj.exclude || [], { cwd: this.servicePath });
    const paths = include.filter((filePath: string) => {
      return exclude.indexOf(filePath) === -1;
    });
    await Promise.all(paths.map((path: string) => {
      return copy(join(this.servicePath, path), join(this.midwayBuildPath, path));
    }));
    this.core.cli.log(` - File copy complete`);
  }

  async layerInstall() {
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
    const npmList = Object.keys(layerTypeList.npm).map((name: string) => layerTypeList.npm[name]);
    if (npmList && npmList.length) {
      await this.npmInstall(npmList);
    }
    this.core.cli.log(` - layers install complete`);
  }

  // 安装npm到构建文件夹
  async npmInstall(npmList?: string[]) {
    return new Promise((resolve, reject) => {
      const pkgJson: string = join(this.midwayBuildPath, 'package.json');
      if (!existsSync(pkgJson)) {
        writeFileSync(pkgJson, '{}');
      }
      exec(`cd ${this.midwayBuildPath};${this.options.npm || 'npm'} install ${npmList ? `${npmList.join(' ')}` : '--production'}`, (err) => {
        if (err) {
          const errmsg = err && err.message || err;
          this.core.cli.log(` - npm install err ${errmsg}`);
          reject(errmsg);
        } else {
          resolve(true);
        }
      });
    });
  }

  async depInstall() {
    if (this.options.ncc) {
      this.core.cli.log(' - Dep install skip: using ncc');
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
    const allDependencies = Object.assign({}, this.core.service.globalDependencies, pkgJson.dependencies, pkgJson.localDependencies);
    pkgJson.dependencies = {};
    const localDep = {};
    for (const depName in allDependencies) {
      const depVersion = allDependencies[depName];
      if (/^(\.|\/)/.test(depVersion)) { // local dep
        const depPath = join(this.servicePath, depVersion);
        if (existsSync(depPath)) {
          localDep[depName] = depPath;
        } else {
          this.core.cli.log(` - local dep ${depName}:${depVersion} not exists`);
        }
      } else {
        pkgJson.dependencies[depName] = depVersion;
      }
    }
    writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '  '));
    await this.npmInstall();
    for (const localDepName in localDep) {
      const target = join(this.midwayBuildPath, 'node_modules', localDepName);
      await copy(localDep[localDepName], target);
    }
    this.core.cli.log(` - Dep install complete`);
  }

  async tscompile() {
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
      const servicePath: string = this.midwayBuildPath;
      await builder.run({
        cwd: servicePath,
        argv: {
          clean: true,
          project: 'tsconfig.json',
          srcDir: 'src'
        }
      });
      await remove(join(this.midwayBuildPath, 'src'));
    }
    this.core.cli.log(` - Build Midway FaaS complete`);
  }

  async package() {
    // 跳过打包
    const options: any = this.core.processedInput.options;
    if (options.skipZip) {
      return;
    }
    // 构建打包
    const file = join(this.servicePath, 'serverless.zip');
    await this.makeZip(this.midwayBuildPath, file);
    const stat = statSync(file);
    this.core.cli.log(` - Zip size ${Number(stat.size / (1024 * 1024)).toFixed(2)}MB`);
    if (this.options.package) {
      const to = resolve(this.servicePath, this.options.package);
      await copy(file, to);
      await unlinkSync(file);
    }
  }

  makeZip(sourceDirection: string, targetFileName: string) {
    return new Promise(resolve => {
      const output = createWriteStream(targetFileName);
      output.on('close', function () {
        resolve(archive.pointer());
      });
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      archive.pipe(output);
      archive.directory(sourceDirection, false);
      archive.finalize();
    });
  }
}
