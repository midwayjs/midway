import { BasePlugin } from '@midwayjs/fcli-command-core';
import { join, isAbsolute } from 'path';
import { templateList } from './list';
import { LightGenerator } from 'light-generator';
const { Select, Input, Form } = require('enquirer');

async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

export class CreatePlugin extends BasePlugin {
  core: any;
  options: any;
  servicePath = this.core.config.servicePath;
  showPrompt = true;
  npmClient = 'npm';
  _innerPrompt;
  templateList;
  npmPackageName;
  localBoilerplatePath;

  constructor(core, options) {
    super(core, options);
    this.loadTemplateList();
    this.commands = {
      create: {
        usage: 'Create new Ali FaaS service',
        lifecycleEvents: ['create'],
        options: {
          'template': {
            usage: `Template for the service. Available templates: ${this.humanReadableTemplateList()}`,
            shortcut: 't',
          },
          'path': {
            usage:
              'The path where the service should be created (e.g. --path my-service).',
            shortcut: 'p',
          },
          'template-path': {
            usage:
              'Your code will be created from this local template.',
          },
          'template-package': {
            usage:
              'Your code will be created from this npm package.',
          }
        },
      },
    };
  }

  set prompt(value) {
    const originRun = value.run;
    value.run = async () => {
      await this.beforePromptSubmit();
      return originRun.call(value);
    };
    this._innerPrompt = value;
  }

  get prompt() {
    return this._innerPrompt;
  }

  hooks = {
    'create:create': this.create.bind(this),
  };

  async beforePromptSubmit() {}

  async create() {
    this.core.cli.log('Generating boilerplate...');
    if (this.options['template']) {
      this.npmPackageName = this.templateList[this.options.template].package;
      await this.createFromTemplate();
    } else if (this.options['template-package']) {
      this.npmPackageName = this.options['template-package'];
      await this.createFromTemplate();
    } else if (this.options['template-path']) {
      if (!isAbsolute(this.options['template-path'])) {
        this.localBoilerplatePath = join(this.servicePath, this.options['template-path']);
      } else {
        this.localBoilerplatePath = this.options['template-path'];
      }
      await this.createFromTemplate();
    } else {
      this.prompt = new Select({
        name: 'templateName',
        message: 'Hello, traveller.\n  Which template do you like?',
        choices: Object.keys(this.templateList).map(template => {
          return `${template} - ${this.templateList[template].desc}`;
        }),
        result: value => {
          return value.split(' - ')[0];
        },
        show: this.showPrompt,
      });

      this.options.template = await this.prompt.run();
      this.npmPackageName = this.templateList[this.options.template].package;
      await this.createFromTemplate();
    }
    // done
    this.printUsage();
  }

  async createFromTemplate() {
    if (!this.options.path) {
      this.prompt = new Input({
        message: `The directory where the service should be created`,
        initial: 'my_new_serverless',
        show: this.showPrompt,
      });
      const targetPath = await this.prompt.run();
      this.options.path = targetPath;
    }

    const boilerplatePath = this.options.path || '';
    const newPath = join(this.servicePath, boilerplatePath);
    const lightGenerator = new LightGenerator();
    let generator;
    if (this.npmPackageName) {
      // 利用 npm 包
      generator = lightGenerator.defineNpmPackage({
        npmClient: this.npmClient,
        npmPackage: this.npmPackageName,
        targetPath: newPath,
      });
    } else {
      // 利用本地路径
      generator = lightGenerator.defineLocalPath({
        templatePath: this.localBoilerplatePath,
        targetPath: newPath,
      });
    }

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
      await this.readyGenerate();
      await generator.run(parameters);
    } else {
      await this.readyGenerate();
      await generator.run();
    }
    this.core.cli.log(
      `Successfully generated boilerplate for template: "${this.options.template || this.npmPackageName || this.localBoilerplatePath}"`
    );
    this.core.cli.log();
  }

  async readyGenerate() {
    this.core.cli.log();
    await sleep(1000);
    this.core.cli.log('1...');
    await sleep(1000);
    this.core.cli.log('2...');
    await sleep(1000);
    this.core.cli.log('3...');
    await sleep(1000);
    this.core.cli.log('Enjoy it...');
    this.core.cli.log();
  }

  printUsage() {
    this.core.cli.log(`Usage:
    - cd ${this.options.path}
    - ${this.npmClient} install
    - ${this.npmClient} run test
    - and read README.md
    `);
    this.core.cli.log('Document: https://midwayjs.org/faas');
  }

  loadTemplateList() {
    this.templateList = templateList;
  }

  humanReadableTemplateList() {
    // class wide constants
    const validTemplates = Object.keys(this.templateList);
    return `${validTemplates
    .slice(0, -1)
    .map(template => `"${template}"`)
    .join(', ')} and "${validTemplates.slice(-1)}"`;
  }

}
