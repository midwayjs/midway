import { IProviderInstance } from './provider';
import { ICommandInstance } from './plugin';
import { SpecStructure } from '@midwayjs/serverless-spec-builder';
export interface ILog {
  log: (...any) => void;
  error?: (...any) => void;
}

export interface IOptions {
  provider: string; // provider名称，如aliyun，会挂在到插件的 core.provider.name 上
  options?: any; // 参数，会处理后挂在到插件的 options 上
  commands?: string[]; // 命令列表，如 ['invoke']
  service?: any; // 服务配置，也就是读取 yaml 文件的内容需要挂在上，会透传到插件的 core.service 上
  config?: any; // 通用配置，会挂在到插件的 core.config 上，一般 servicePath 需要在此配置
  log?: ILog;
  extensions?: {
    // 更多的扩展内容，会透传到插件的 core 上
    [extensionName: string]: any;
  };
  displayUsage?: any; // 使用帮助的展示处理
  point?: any; // 埋点   (type: string, commandsArray: string[], commandInfo: any, this);
  npm?: string; // 使用何种npm加速
  stopLifecycle?: string; // 生命周期执行到什么时候终止，例如 invoke:invoke
  disableAutoLoad?: boolean; // 是否禁用自动加载插件
  cwd?: string; // command core 执行时cwd目录
}

export interface ICommandHooksCore {
  addPlugin(plugin: IPlugin): void;
  store: IStore<any>;
  options: any;
}

interface IStore<T> {
  [index: string]: T;
  [index: number]: T;
}

interface CoreService extends Omit<SpecStructure, 'functions'> {
  experimentalFeatures?: {
    [featureName: string]: any;
  };
  globalDependencies?: any;
  functions: object;
}

export interface ICoreInstance {
  classes: any;
  cli: ILog | Console;
  config: any;
  getProvider(providerName: string): IProviderInstance;
  invoke(commandsArray?: string[], allowEntryPoints?: boolean, options?: any);
  pluginManager: ICommandHooksCore;
  store: IStore<any>;
  debug: any;
  service: CoreService;
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
