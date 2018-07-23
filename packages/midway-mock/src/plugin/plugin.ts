import {AliPluginContainer} from '../interfaces';
import {ObjectDefinition} from 'midway-context';
import {PluginObjectCreator} from './PluginObjectCreator';
import {loadConfig} from '../util';

const path = require('path');

export interface PluginArgs {
  baseDir?: string;
  name?: string;
  pluginContainer?: AliPluginContainer;
  dependencies: string[];
  optionalDependencies: string[];
  logger;
  isAgent: boolean;
  env: string;
  antx: any;
}

export class Plugin {

  options: PluginArgs = {
    dependencies: [],
    optionalDependencies: [],
    logger: console,
    isAgent: false,
    env: 'prod',
    antx: {},
  };

  config;

  constructor(opts: PluginArgs) {
    this.options = Object.assign(this.options, opts);
    this.load();
  }

  load() {
    // merge plugin config to global config
    this.config = loadConfig(
      [this.options.baseDir],
      this.options.env,
      this.options.antx,
    );
  }

  private getFile(filename) {
    return path.join(this.options.baseDir, filename);
  }

  getDefinition() {
    const objectDefinition = new ObjectDefinition();
    objectDefinition.creator = new PluginObjectCreator(objectDefinition, this.options.pluginContainer);
    objectDefinition.id = this.options.name;
    objectDefinition.dependsOn = this.options.dependencies;
    objectDefinition.path = path.join(this.options.baseDir, this.options.isAgent ? 'agent.js' : 'app.js');

    return objectDefinition;
  }

}
