import { CommandBase, ICommand, IHooks } from '../../../core/commandBase';
import { BuildCommand } from 'midway-bin';
import { createWriteStream, unlinkSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { remove, ensureDir, copy, statSync } from 'fs-extra';
import { formatLayers } from '../../../core/utils';
import * as zipService from 'serverless/lib/plugins/package/lib/zipService';
import * as packageService from 'serverless/lib/plugins/package/lib/packageService';
import * as co from 'co';
import { join, resolve } from 'path';
import * as archiver from 'archiver';
import * as ora from 'ora';
import * as globby from 'globby';
// const { buildByNcc } = require('./ncc');

export class Package extends CommandBase {

  isTsDir;
  servicePath: string;
  midwayBuildPath: string;
  config: any;
  resolveFilePathsAll: any;

  constructor(provider) {
    super(provider);
    Object.assign(this, zipService, packageService);
  }

  getCommand(): ICommand {
    const lifecycleEvents = [
      'midway-cleanup',
      'midway-spec',
      'midway-wrapper',
      'midway-copyFile',
      'midway-layerInstall',
      'midway-depInstall',
      'midway-compileFunctions',
      'midway-package',
      'midway-finalize'
    ];
    return {
      package: {
        usage: 'Packages a Serverless service',
        lifecycleEvents,
        options: {
          ncc: { usage: 'Using ncc build', shortcut: 'c' },
          npm: { usage: 'Specify NPM, such as cnpm', shortcut: 'n' },
          package: { usage: 'Output path for the package', shortcut: 'p' }
        }
      }
    };
  }

  getHooks(): IHooks {
    return {
      'package:midway-cleanup': async () => {
        const options: any = this.serverless.processedInput.options;
        // 跳过清理
        if (!options.skipClean) {
          await remove(this.midwayBuildPath);
        }
        await ensureDir(this.midwayBuildPath);
        this.serverless.cli.log('Package initialize');
      },
      'package:midway-copyFile': async () => {
        const timeTick = this.tick();
        const spinner = ora(' - Package files copying').start();
        const packageObj: any = this.serverless.service.package || {};
        const include = await globby(['src', 'tsconfig.json', 'package.json'].concat(packageObj.include || []));
        const exclude = await globby(packageObj.exclude || []);
        const paths = include.filter((filePath: string) => {
          return exclude.indexOf(filePath) === -1;
        });
        await Promise.all(paths.map((path: string) => {
          return copy(join(this.servicePath, path), join(this.midwayBuildPath, path));
        }));
        spinner.stop();
        this.serverless.cli.log(` - File copy complete (${timeTick()}ms)`);
      },
      'package:midway-layerInstall': async () => {
        // serverless.yml - layers
        const timeTick = this.tick();
        const spinner = ora(' - Layers installing').start();
        const funcLayers = [];
        if (this.serverless.service.functions) {
          for (const func in this.serverless.service.functions) {
            const funcConf = this.serverless.service.functions[func];
            if (funcConf.layers) {
              funcLayers.push(funcConf.layers);
            }
          }
        }
        const layerTypeList = formatLayers(this.serverless.service.layers, ...funcLayers);
        const npmList = Object.keys(layerTypeList.npm).map((name: string) => layerTypeList.npm[name]);
        if (npmList && npmList.length) {
          await this.npmInstall(npmList);
        }
        spinner.stop();
        this.serverless.cli.log(` - layers install complete (${timeTick()}ms)`);
      },
      'package:midway-depInstall': async () => {
        if (this.options.ncc) {
          this.serverless.cli.log(' - Dep install skip: using ncc');
          return;
        }
        const timeTick = this.tick();
        const spinner = ora({
          prefixText: ' - Dep Installing'
        }).start();
        // globalDependencies
        // pkg.json dependencies
        // pkg.json localDependencies
        const pkgJsonPath: string = join(this.midwayBuildPath, 'package.json');
        let pkgJson: any = {};
        try {
          pkgJson = JSON.parse(readFileSync(pkgJsonPath).toString());
        } catch (e) {}
        const allDependencies = Object.assign({}, this.serverless.service.globalDependencies, pkgJson.dependencies, pkgJson.localDependencies);
        pkgJson.dependencies = {};
        const localDep = {};

        for (const depName in allDependencies) {
          const depVersion = allDependencies[depName];
          if (/^(\.|\/)/.test(depVersion)) { // local dep
            const depPath = join(this.servicePath, depVersion);
            if (existsSync(depPath)) {
              localDep[depName] = depPath;
            } else {
              this.serverless.cli.log(` - local dep ${depName}:${depVersion} not exists`);
            }
          } else {
            pkgJson.dependencies[depName] = depVersion;
          }
        }
        writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '  '));
        spinner.text = `${this.options.npm || 'npm'} install`;
        await this.npmInstall();
        for (const localDepName in localDep) {
          spinner.text = localDepName;
          const target = join(this.midwayBuildPath, 'node_modules', localDepName);
          await copy(localDep[localDepName], target);
        }
        spinner.stop();
        this.serverless.cli.log(` - Dep install complete (${timeTick()}ms)`);
      },
      'package:midway-compileFunctions': async () => { // 构建midway faas
        this.serverless.cli.log('Building Midway FaaS directory files...');
        if (!this.isTsDir) {
          this.serverless.cli.log(' - Not found tsconfig.json and skip build');
          return;
        }
        const timeTick = this.tick();
        if (this.options.ncc) {
          this.serverless.cli.log(' - Using single file build mode');
          // await buildByNcc();
        } else {
          this.serverless.cli.log(' - Using tradition build mode');
          const spinner = ora(' - Compiling Functions').start();
          const builder = new BuildCommand();
          const servicePath: string = this.midwayBuildPath;
          await co(function* () {
            yield builder.run({
              cwd: servicePath,
              argv: {
                clean: true,
                project: 'tsconfig.json',
                srcDir: 'src'
              }
            });
          });
          await remove(join(this.midwayBuildPath, 'src'));
          spinner.stop();
        }
        this.serverless.cli.log(` - Build Midway FaaS complete (${timeTick()}ms)`);
      },
      'package:midway-package': async () => {
        // 跳过打包
        const options: any = this.serverless.processedInput.options;
        if (options.skipZip) {
          return;
        }
        // 构建打包
        const file = join(this.servicePath, 'serverless.zip');
        await this.makeZip(this.midwayBuildPath, file);
        const stat = statSync(file);
        this.serverless.cli.log(` - Zip size ${Number(stat.size / (1024 * 1024)).toFixed(2)}MB`);
        if (this.options.package) {
          const to = resolve(this.servicePath, this.options.package);
          await copy(file, to);
          await unlinkSync(file);
        }
      }
    };
  }

  makeZip(source, target) {
    return new Promise(resolve => {
      const output = createWriteStream(target);
      output.on('close', function () {
        resolve(archive.pointer());
      });
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      archive.pipe(output);
      archive.directory(source, false);
      archive.finalize();
    });
  }
}
