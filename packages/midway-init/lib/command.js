'use strict';

const path = require('path');
const { LightGenerator } = require('light-generator');
const { Input, Select, Form } = require('enquirer');
const chalk = require('chalk');
const { getParser } = require('./parser');

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

class MidwayInitCommand {

  constructor(npmClient) {
    this.npmClient = npmClient || 'npm';
  }

  async run(cwd, args) {
    const argv = this.argv = getParser().parse(args || []);
    this.cwd = cwd;

    this.templateList = await this.getTemplateList();

    if (argv.template) {
      await this.createFromTemplate();
    } else {
      const prompt = new Select({
        name: 'templateName',
        message: 'Hello, traveller.\n  Which template do you like?',
        choices: Object.keys(this.templateList).map(template => {
          return `${template} - ${this.templateList[template].description}` +
            (this.templateList[template].author ? `(by @${chalk.underline.bold(this.templateList[template].author)})` : '');
        }),
        result: value => {
          return value.split(' - ')[0];
        },
      });
      // get user input template
      this.template = await prompt.run();
      await this.createFromTemplate();
    }
    // done
    this.printUsage();
  }

  async createFromTemplate() {
    if (!this.argv.dir) {
      const prompt = new Input({
        message: 'The directory where the boilerplate should be created',
        initial: 'my_midway_app',
      });
      // get target path where template will be copy to
      this.targetPath = await prompt.run();
    } else {
      this.targetPath = this.argv.dir;
    }

    const boilerplatePath = this.targetPath || '';
    const newPath = path.join(process.cwd(), boilerplatePath);
    const lightGenerator = new LightGenerator();
    const generator = lightGenerator.defineNpmPackage({
      npmClient: this.npmClient,
      npmPackage: this.templateList[this.template].package,
      targetPath: newPath,
    });

    const args = await generator.getParameterList();
    const argsKeys = Object.keys(args);
    if (argsKeys && argsKeys.length) {
      const prompt = new Form({
        name: 'user',
        message: 'Please provide the following information:',
        choices: argsKeys.map(argsKey => {
          return {
            name: `${argsKey}`,
            message: `${args[argsKey].desc}`,
            initial: `${args[argsKey].default}`,
          };
        }),
      });

      const parameters = await prompt.run();
      await this.readyGenerate();
      await generator.run(parameters);
    } else {
      await this.readyGenerate();
      await generator.run();
    }
  }

  async getTemplateList() {
    if (!this.template) {
      return require(defaultOptions.templateListPath);
    }
  }

  async readyGenerate() {
    console.log();
    await sleep(1000);
    console.log('1...');
    await sleep(1000);
    console.log('2...');
    await sleep(1000);
    console.log('3...');
    await sleep(1000);
    console.log('Enjoy it...');
  }

  printUsage() {
    // this.serverless.cli.asciiGreeting();
    // this.serverless.cli
    //   .log(`Successfully generated boilerplate for template: "${this.options.template}"`);
    console.log();
  }
}

module.exports = MidwayInitCommand;
