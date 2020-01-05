import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { BasePlugin, getCoreBaseDir } from '.';

export class PluginManager extends BasePlugin {
  commands = {
    plugin: {
      usage: 'manage plugins',
      options: {
        update: {
          usage: 'update a plugin',
          shortcut: 'u',
        },
        remove: {
          usage: 'remove a plugin',
          shortcut: 'r',
        },
        install: {
          usage: 'install a plugin',
          shortcut: 'i',
        },
        list: {
          usage: 'list all plugin',
          shortcut: 'l',
        },
        root: {
          usage: 'get plugin root path',
        },
        all: {
          usage: 'do something all',
          shortcut: 'a',
        },
        npm: {
          usage: 'npm',
          shortcut: 'n',
        },
      },
      lifecycleEvents: ['plugin'],
    },
  };

  hooks = {
    'plugin:plugin': async () => {
      if (this.options.update) {
        await this.update();
      } else if (this.options.install) {
        await this.install();
      } else if (this.options.list) {
        await this.list();
      } else if (this.options.root) {
        this.core.cli.log(`  - plugin root path is ${getCoreBaseDir()}`);
      }
    },
  };

  async update() {
    if (this.options.a) {
      console.log('update all');
    } else if (typeof this.options.update === 'string') {
      await this.updatePlugin(this.options.update);
    }
  }

  async list() {
    const plugins = this.getAllPlugins();
    plugins.forEach(plugin => {
      const version = this.getPluginVersion(plugin);
      this.core.cli.log(`  - ${plugin}${version ? `@${version}` : ''}`);
    });
  }

  async install() {
    if (typeof this.options.install === 'string') {
      const plugin = this.options.install.replace(/@.*$/, '');
      const dir: string = getCoreBaseDir();
      await this.execPromise(
        `cd ${join(dir, '../')};${this.options.npm || 'npm'} install ${
          this.options.install
        } --production`
      );
      this.core.cli.log(`  - installed '${plugin}'`);
    } else {
      this.core.cli.log(`please user plugin -i=<plugin name>`);
    }
  }

  getAllPlugins() {
    const dir: string = getCoreBaseDir();
    if (!existsSync(dir)) {
      return [];
    }
    const files = readdirSync(dir);

    const plugins = files.filter(file => {
      return /midway-plugin/.test(file);
    });
    return plugins;
  }

  getPluginVersion(plugin) {
    const dir: string = getCoreBaseDir();
    const pkgJson = join(dir, plugin, 'package.json');
    let version = '';
    try {
      version = JSON.parse(readFileSync(pkgJson).toString()).version;
    } catch (E) {}
    return version;
  }

  async updatePlugin(newPlugin) {
    const plugin = newPlugin.replace(/@.*$/, '');
    const oldVersion = this.getPluginVersion(plugin);
    const dir: string = getCoreBaseDir();
    await this.execPromise(`cd ${dir};rm -rf ${plugin}`);
    await this.execPromise(
      `cd ${join(dir, '../')};${this.options.npm ||
        'npm'} install ${newPlugin} --production`
    );
    const newVersion = this.getPluginVersion(plugin);
    this.core.cli.log(
      `  - update '${plugin}'${oldVersion ? ` from ${oldVersion}` : ''}${
        newVersion ? ` to ${newVersion}` : ''
      }`
    );
  }

  execPromise(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
