import {
  IPluginInstance,
  IPluginHooks,
  IPluginCommands,
} from './interface/plugin';
import { ICoreInstance } from './interface/commandHookCore';

export class BasePlugin implements IPluginInstance {
  public core: ICoreInstance;
  public options: any;
  public commands: IPluginCommands;
  public hooks: IPluginHooks;
  private name: string = this.getName();

  constructor(core: ICoreInstance, options: any) {
    this.core = core;
    this.options = options;
    this.commands = {};
    this.hooks = {};
  }

  public getName() {
    return this.constructor.name;
  }

  public setStore(key: string, value: any, isGlobalScope?: boolean) {
    const scope = isGlobalScope ? 'global' : this.name;
    this.core.store.set(`${scope}:${key}`, value);
  }

  public getStore(key: string, scope?: string) {
    return this.core.store.get(`${scope || this.name}:${key}`);
  }

  setGlobalDependencies(name: string, version?: string) {
    if (!this.core.service.globalDependencies) {
      this.core.service.globalDependencies = {};
    }
    this.core.service.globalDependencies[name] = version || '*';
  }
}
