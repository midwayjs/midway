import { IProviderInstance } from './provider';
import { ICommandInstance } from './plugin';
export interface ILog {
  log: (...any) => void;
  error?: (...any) => void;
}

export interface IOptions {
  provider: string;
  options?: any;
  commands?: string[];
  service?: any;
  config?: any;
  log?: ILog;
  extensions?: {
    [extensionName: string]: any;
  };
  displayUsage?: any;
}

export interface ICommandHooksCore {
  addPlugin(plugin: IPlugin): void;
}

export interface ICoreInstance {
  classes: any;
  cli: ILog | Console;
  config: any;
  getProvider(providerName: string): IProviderInstance;
  invoke(commandsArray: string[], allowEntryPoints?: boolean, options?: any);
  pluginManager: ICommandHooksCore;
  service: {
    provider: {
      name: string;
    };
  };
  processedInput: {
    options: any;
    commands: string[];
  };
  setProvider(providerName: string, providerInstance: IProviderInstance);
  spawn(commandsArray: string[], options?: any);
}

export declare class IPlugin {
  constructor(coreInstance: ICoreInstance, options: any);
}

export interface ICommands {
  [command: string]: {
    usage: string;
    type: string;
    lifecycleEvents: string[];
    rank: number;
    options: {};
    origin: ICommandInstance[];
    commands: ICommands;
  };
}

export type IHookFun = () => Promise<void> | void;

export interface IHooks {
  [lifestyle: string]: IHookFun[];
}
