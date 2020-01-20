import { BasePlugin } from '@midwayjs/fcli-command-core';
import { join } from 'path';
const templateList = require('./list');
const { LightGenerator } = require('light-generator');
const { Select, Input, Form } = require('enquirer');

async function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

// class wide constants
const validTemplates = Object.keys(templateList);
const humanReadableTemplateList = `${validTemplates
  .slice(0, -1)
  .map(template => `"${template}"`)
  .join(', ')} and "${validTemplates.slice(-1)}"`;

export class CreatePlugin extends BasePlugin {
  core: any;
  options: any;
  servicePath = this.core.config.servicePath;
  showPrompt = true;
  npmClient = 'npm';
  _innerPrompt;

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

  commands = {
    create: {
      usage: 'Create new Ali FaaS service',
      lifecycleEvents: ['create'],
      options: {
        template: {
          usage: `Template for the service. Available templates: ${humanReadableTemplateList}`,
          shortcut: 't',
        },
        path: {
          usage:
            'The path where the service should be created (e.g. --path my-service)',
          shortcut: 'p',
        },
      },
    },
  };

  hooks = {
    'create:create': this.create.bind(this),
  };

  async beforePromptSubmit() {}

  async create() {
    this.core.cli.log('Generating boilerplate...');

    if (this.options['template']) {
      await this.createFromTemplate();
    } else {
      this.prompt = new Select({
        name: 'templateName',
        message: 'Hello, traveller.\n  Which template do you like?',
        choices: Object.keys(templateList).map(template => {
          return `${template} - ${templateList[template].desc}`;
        }),
        result: value => {
          return value.split(' - ')[0];
        },
        show: this.showPrompt,
      });

      this.options.template = await this.prompt.run();
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
    const generator = lightGenerator.defineNpmPackage({
      npmClient: this.npmClient,
      npmPackage: templateList[this.options.template].package,
      targetPath: newPath,
    });

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
      `Successfully generated boilerplate for template: "${this.options.template}"`
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
}
