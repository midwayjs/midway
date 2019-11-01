'use strict';

const path = require('path');
const { LightGenerator } = require('light-generator');
const { Input, Select, Form } = require('enquirer');
const chalk = require('chalk');
const { getParser } = require('./parser');
const { EventEmitter } = require('events');
const fs = require('fs');
const os = require('os');

async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

const defaultOptions = {
  templateListPath: path.join(__dirname, '../boilerplate.json'),
};

class MidwayInitCommand extends EventEmitter {
  constructor(npmClient) {
    super();
    this.npmClient = npmClient || 'npm';
    this._innerPrompt = null;
    this.showPrompt = true;
  }

  set prompt(value) {
    const originRun = value.run;
    value.run = async () => {
      await this.beforePromptSubmit();
      return await originRun.call(value);
    };
    this._innerPrompt = value;
  }

  get prompt() {
    return this._innerPrompt;
  }

  async beforePromptSubmit() {}

  async run(cwd, args) {
    const argv = (this.argv = getParser().parse(args || []));
    this.cwd = cwd;

    this.templateList = await this.getTemplateList();

    if (argv.dir) {
      // support --dir argument
      this.targetPath = argv.dir;
    }

    if (argv.registry) {
      this.registryUrl = this.getRegistryByType(argv.registry);
    }

    if (argv.type) {
      // support --type argument
      this.templateName = argv.type;
      await this.createFromTemplate();
    } else if (argv.template) {
      // support --template argument
      // ready targetDir
      await this.createTargetDir();
      const lightGenerator = this.createGenerator();
      const generator = lightGenerator.defineLocalPath({
        templatePath: this.getAbsoluteDir(argv.template),
        targetPath: this.targetPath,
      });
      await this.execBoilerplate(generator);
    } else if (argv.package) {
      // support --package argument
      await this.createFromTemplate(argv.package);
    } else {
      this.prompt = new Select({
        name: 'templateName',
        message: 'Hello, traveller.\n  Which template do you like?',
        choices: Object.keys(this.templateList).map(template => {
          return (
            `${template} - ${this.templateList[template].description}` +
            (this.templateList[template].author
              ? `(by @${chalk.underline.bold(
                this.templateList[template].author
              )})`
              : '')
          );
        }),
        result: value => {
          return value.split(' - ')[0];
        },
        show: this.showPrompt,
      });
      // get user input template
      this.templateName = await this.prompt.run();
      await this.createFromTemplate();
    }
    // done
    this.printUsage();
  }

  async createFromTemplate(packageName) {
    // ready targetDir
    await this.createTargetDir();
    const lightGenerator = this.createGenerator();
    const generator = lightGenerator.defineNpmPackage({
      npmClient: this.npmClient,
      npmPackage: packageName || this.templateList[this.templateName].package,
      targetPath: this.targetPath,
      registryUrl: this.registryUrl,
    });
    await this.execBoilerplate(generator);
  }

  async getTemplateList() {
    if (!this.templateName) {
      return require(defaultOptions.templateListPath);
    }
  }

  async readyGenerate(asyncFunction) {
    console.log();
    this.log('Preparing your project, please wait a moment...');
    await sleep(2000);
    this.log('1...');
    await sleep(1000);
    this.log('2...');
    await sleep(1000);
    this.log('3...');
    if (asyncFunction) {
      await asyncFunction();
    }
    await sleep(1000);
    this.log(
      'Initialization program has been executed successfully,enjoy it...'
    );
    console.log();
  }

  createGenerator() {
    return new LightGenerator();
  }

  async createTargetDir() {
    if (!this.targetPath) {
      this.prompt = new Input({
        message: 'The directory where the boilerplate should be created',
        initial: 'my_midway_app',
        show: this.showPrompt,
      });
      // get target path where template will be copy to
      this.targetPath = await this.prompt.run();
    }
    this.targetPath = this.getAbsoluteDir(this.targetPath);
  }

  async execBoilerplate(generator) {
    this.log('Fetch the boilerplate which you like...');
    const args = await generator.getParameterList();
    const argsKeys = Object.keys(args);
    if (argsKeys && argsKeys.length) {
      this.prompt = new Form({
        name: 'user',
        message: 'Please provide the following information:',
        choices: argsKeys.map(argsKey => {
          return {
            name: `${argsKey}`,
            message: `${args[argsKey].desc}`,
            initial: `${args[argsKey].default}`,
          };
        }),
        show: this.showPrompt,
      });

      const parameters = await this.prompt.run();
      // remove undefined property
      Object.keys(parameters).forEach(
        key => parameters[key] === undefined && delete parameters[key]
      );
      await this.readyGenerate(async () => {
        await generator.run(parameters);
      });
    } else {
      await this.readyGenerate(async () => {
        await generator.run();
      });
    }
  }

  getAbsoluteDir(dir) {
    if (!path.isAbsolute(dir)) {
      dir = path.join(process.cwd(), dir);
    }
    return dir;
  }

  /**
   * log with prefix
   */
  log() {
    const args = Array.prototype.slice.call(arguments);
    args[0] = chalk.green('✔ ') + chalk.bold(args[0]);
    console.log.apply(console, args);
  }

  printUsage() {
    this.log(`Usage:
    - cd ${this.targetPath}
    - npm install
    - npm run dev / npm start / npm test
    `);
    this.log('Document: https://midwayjs.org/midway/guide.html');
  }

  /**
   * get registryUrl by short name
   * @param {String} key - short name, support `china / npm / npmrc`, default to read from .npmrc
   * @return {String} registryUrl
   */
  getRegistryByType(key) {
    switch (key) {
      case 'china':
        return 'https://registry.npm.taobao.org';
      case 'npm':
        return 'https://registry.npmjs.org';
      default: {
        if (/^https?:/.test(key)) {
          return key.replace(/\/$/, '');
        } else {
          // support .npmrc
          const home = os.homedir();
          let url =
            process.env.npm_registry ||
            process.env.npm_config_registry ||
            'https://registry.npmjs.org';
          if (
            fs.existsSync(path.join(home, '.cnpmrc')) ||
            fs.existsSync(path.join(home, '.tnpmrc'))
          ) {
            url = 'https://registry.npm.taobao.org';
          }
          url = url.replace(/\/$/, '');
          return url;
        }
      }
    }
  }
}

module.exports = MidwayInitCommand;
