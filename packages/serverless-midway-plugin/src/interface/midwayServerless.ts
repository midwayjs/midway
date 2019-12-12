export interface Ilayer {
  [extName: string]: {
    path: string;
  };
}

export interface IServerless {
  pluginManager: any;
  providerName: any;
  service: {
    functions: {
      [funcName: string]: {
        handler: string;
        events: any;
        initialize?: string;
        layers?: Ilayer
        functions?: string[]
        _ignore?: boolean
        _isAggregation?: boolean
        _handlers?: any
        _originPath?: string
      }
    },
    provider: {
      name: string;
      runtime: string;
      [othKey: string]: any;
    };
    layers?: Ilayer;
    package: {
      includes?: any;
      excludes?: any;
      artifact?: string;
      [key: string]: any;
    };
    [othKey: string]: any;
  };
  processedInput: {
    commands: ICommandParam;
    options: ICommandOptions;
  };
  [key: string]: any;
}

export type IServerlessOptions = any;

export interface ICommandObject {
  getCommand: () => ICommand;
  getHooks: () => IHooks;
}

export interface ICommand {
  [command: string]: {
    usage: string;
    lifecycleEvents: string[];
    options?: {
      [option: string]: {
        usage: string;
        shortcut?: string;
      }
    }
  };
}

export interface IHooks {
  [hook: string]: () => any;
}

export type IProvider = any;

export interface IConfig {
  commands: ICommand;
  hooks: IHooks;
}

export type ICommandParam = string[];
export interface ICommandOptions {
  [key: string]: string | boolean;
}
