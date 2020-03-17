import {
  IOptions,
  ICommandHooksCore,
  ICoreInstance,
  ICommands,
  IHooks,
} from './interface/commandHookCore';
import { IPluginInstance, ICommandInstance } from './interface/plugin';
import { IProviderInstance } from './interface/provider';
import GetMap from './errorMap';
import { loadNpm } from './npm';

const RegProviderNpm = /^npm:([\w]*):(.*)$/i; // npm providerName pkgName
const RegProviderLocal = /^local:([\w]*):(.*)$/i; // local providerName pkgPath

export class CommandHookCore implements ICommandHooksCore {
  private options: IOptions;
  private instances: IPluginInstance[] = [];
  private commands: ICommands = {};
  private hooks: IHooks = {};
  private coreInstance: ICoreInstance;
  private providers: any = {};
  private npmPlugin: string[] = [];
  private loadNpm: any;

  constructor(options: IOptions) {
    this.options = options || { provider: '' };
    if (!this.options.options) {
      this.options.options = {};
    }

    this.loadNpm = loadNpm.bind(null, this);
    this.coreInstance = this.getCoreInstance();
  }

  // 添加插件
  public addPlugin(Plugin: any) {
    const provider = this.options.provider;
    const coreInstance: ICoreInstance = this.coreInstance;
    let pluginProvider = '';
    // 支持加载npm 或 本地插件（绝对地址）
    if (typeof Plugin === 'string') {
      if (RegProviderNpm.test(Plugin)) {
        const npmProviderMatch: any = RegProviderNpm.exec(Plugin);
        pluginProvider = npmProviderMatch[1];
        if (pluginProvider && pluginProvider !== provider) {
          return;
        }
        this.npmPlugin.push(npmProviderMatch[2]);
      } else if (RegProviderLocal.test(Plugin)) {
        const localProviderMatch: any = RegProviderLocal.exec(Plugin);
        pluginProvider = localProviderMatch[1];
        if (pluginProvider && pluginProvider !== provider) {
          return;
        }
        this.loadLocalPlugin(localProviderMatch[2]);
      } else {
        this.error('pluginType', Plugin);
      }
      return;
    }

    const instance = new Plugin(coreInstance, this.options.options);

    if (instance.provider) {
      if (typeof instance.provider === 'string') {
        pluginProvider = instance.provider;
      } else {
        pluginProvider = instance.provider.constructor.getProviderName();
      }
    }

    // 不支持的provider
    if (pluginProvider && pluginProvider !== provider) {
      return;
    }

    // 避免多次加载
    if (this.instances.length) {
      for (const plugin of this.instances) {
        if (plugin instanceof Plugin) {
          return;
        }
      }
    }
    this.loadCommands(instance, this.commands, instance.commands);
    this.loadHooks(instance.hooks);
    this.instances.push(instance);
  }

  /*
    commandsArray 为多级命令，如 [invoke, local] 则执行 invoke的二级子命令 local
    allowEntryPoints 为是否可以调用 entryPoints
    */
  public async invoke(
    commandsArray?: string[],
    allowEntryPoints?: boolean,
    options?: any
  ) {
    if (commandsArray == null) {
      commandsArray = this.options.commands;
    }
    if (!Array.isArray(commandsArray)) {
      commandsArray = [].concat(commandsArray || []);
    }
    if (options) {
      Object.assign(this.options.options, options);
    }
    const displayHelp = this.options.options.h || this.options.options.help;
    if (!commandsArray.length && displayHelp) {
      return this.displayHelp();
    }
    const commandInfo = this.getCommand(commandsArray, allowEntryPoints);
    const lifecycleEvents = this.loadLifecycle(
      commandInfo.commandName,
      commandInfo.command.lifecycleEvents,
      commandInfo.parentCommandList
    );

    if (this.options.point) {
      this.options.point('invoke', commandsArray, commandInfo, this);
    }

    // 展示帮助
    if (displayHelp) {
      return this.displayHelp(commandsArray, commandInfo.usage);
    }
    for (const lifecycle of lifecycleEvents) {
      const hooks = this.hooks[lifecycle] || [];
      for (const hook of hooks) {
        await hook();
      }
    }
  }

  // spawn('aliyun:invoke')
  public async spawn(commandsArray: string | string[], options?: any) {
    let commands: string[] = [];
    if (typeof commandsArray === 'string') {
      commands = commandsArray.split(':');
    } else {
      commands = commandsArray;
    }
    await this.invoke(commands, true, options);
  }

  public getCommands() {
    return this.commands;
  }

  public async ready() {
    await this.loadNpmPlugins();
    await this.asyncInit();
  }

  // 获取核心instance
  private getCoreInstance(): ICoreInstance {
    const { provider, service, config, extensions, commands } = this.options;
    const serviceData: any = service || {};
    if (!serviceData.provider) {
      serviceData.provider = { name: provider };
    }
    if (!serviceData.service) {
      serviceData.service = service;
    }
    if (provider) {
      serviceData.provider.name = provider;
    }
    return {
      ...(extensions || {}),
      classes: {
        Error,
      },
      store: new Map(),
      cli: this.getLog(),
      config: config || {},
      getProvider: this.getProvider.bind(this),
      invoke: this.invoke.bind(this),
      spawn: this.spawn.bind(this),
      debug: this.debug.bind(this),
      processedInput: {
        options: {},
        commands: commands || [],
      },
      pluginManager: this,
      setProvider: this.setProvider.bind(this),
      service: serviceData,
    };
  }

  // 设置 provider
  private setProvider(
    providerName: string,
    providerInstance: IProviderInstance
  ) {
    this.providers[providerName] = providerInstance;
  }

  // 获取 provider
  private getProvider(providerName: string): IProviderInstance {
    return this.providers[providerName];
  }

  // 加载命令,支持子命令
  private loadCommands(
    instance,
    commandsMap: any,
    commands: any,
    parentCommandList?: string[]
  ) {
    if (!commands) {
      return;
    }
    Object.keys(commands).forEach((command: string) => {
      const commandInstance: ICommandInstance = commands[command];

      if (!commandsMap[command]) {
        commandsMap[command] = {
          usage: '',
          type: commandInstance.type || 'command',
          lifecycleEvents: [],
          rank: -1,
          options: {},
          origin: [],
          commands: {},
        };
      }

      const currentCommand = commandsMap[command];
      commandsMap[command].origin.push(commandInstance);

      const currentRank = commandInstance.rank || 0;

      // 如果当前插件的rank比当前命令的rank大，则会覆盖
      if (currentRank > currentCommand.rank) {
        currentCommand.rank = currentRank;
        currentCommand.lifecycleEvents = commandInstance.lifecycleEvents;
        if (commandInstance.usage) {
          currentCommand.usage = commandInstance.usage;
        }
      }

      // 加载子命令
      if (commandInstance.commands) {
        this.loadCommands(
          instance,
          commandsMap[command].commands,
          commandInstance.commands,
          (parentCommandList || []).concat(command)
        );
      }
      // 合并 options
      currentCommand.options = Object.assign(
        currentCommand.options,
        commandInstance.options
      );
    });
  }

  // 加载hooks
  private loadHooks(hooks: any) {
    if (!hooks) {
      return;
    }
    for (const hookName in hooks) {
      if (!this.hooks[hookName]) {
        this.hooks[hookName] = [];
      }
      this.hooks[hookName].push(hooks[hookName]);
    }
  }

  private loadLifecycle(
    command: string,
    lifecycleEvents: string[] | undefined,
    parentCommandList?: string[]
  ) {
    const allLifecycles: string[] = [];
    const parentCommand =
      parentCommandList && parentCommandList.length
        ? `${parentCommandList.join(':')}:`
        : '';
    if (lifecycleEvents) {
      for (const life of lifecycleEvents) {
        const tmpLife = `${parentCommand}${command}:${life}`;
        allLifecycles.push(`before:${tmpLife}`);
        allLifecycles.push(tmpLife);
        allLifecycles.push(`after:${tmpLife}`);
      }
    }
    return allLifecycles;
  }

  private getCommand(commandsArray: string[], allowEntryPoints?: boolean): any {
    let command: string | undefined = '';
    // tslint:disable-next-line: no-this-assignment
    let cmdObj: any = this;
    const commandPath: string[] = [];
    const parentCommandList: string[] = [];
    const usage = {};
    for (command of commandsArray) {
      if (commandPath.length) {
        parentCommandList.push(commandPath[commandPath.length - 1]);
      }
      commandPath.push(command);
      if (!cmdObj || !cmdObj.commands || !cmdObj.commands[command]) {
        this.error('commandNotFound', { command, commandPath });
      }
      cmdObj = cmdObj.commands[command];
      if (cmdObj.options) {
        this.commandOptions(cmdObj.options, usage);
      }
    }
    if (!cmdObj) {
      this.error('commandNotFound', { command, commandPath });
    }
    if (cmdObj.type === 'entrypoint' && !allowEntryPoints) {
      this.error('commandIsEntrypoint', { command, commandPath });
    }

    return {
      commandName: command,
      command: cmdObj,
      usage,
      parentCommandList,
    };
  }

  // 加载本地插件
  private async loadLocalPlugin(localPath) {
    try {
      let plugin = require(localPath);
      if (typeof plugin === 'object') {
        plugin = plugin[Object.keys(plugin)[0]];
      }
      this.addPlugin(plugin);
    } catch (e) {
      this.error('localPlugin', { path: localPath, err: e });
    }
  }

  // 加载npm包插件
  private async loadNpmPlugins() {
    for (const npmPath of this.npmPlugin) {
      await this.loadNpm(npmPath, this.options.options.npm || this.options.npm);
    }
  }

  // 插件的异步初始化
  private async asyncInit() {
    for (const instance of this.instances) {
      if (instance.asyncInit) {
        await instance.asyncInit();
      }
    }
  }

  private commandOptions(commandOptions, usage): any {
    if (!commandOptions) {
      return;
    }

    for (const option in commandOptions) {
      const optionInfo = commandOptions[option];
      usage[option] = optionInfo;
      if (optionInfo.shortcut) {
        if (this.options.options[optionInfo.shortcut]) {
          this.options.options[option] = this.options.options[
            optionInfo.shortcut
          ];
        }
      }
      this.coreInstance.processedInput.options[option] = this.options.options[
        option
      ];
    }
  }

  private displayHelp(commandsArray?, usage?) {
    if (this.options.displayUsage) {
      this.options.displayUsage(commandsArray || [], usage || {}, this);
    }
  }

  private getLog() {
    return this.options.log || console;
  }

  error<T>(type: string, info?: T) {
    const errObj: {
      info?: T;
      message: string;
    } = GetMap(type, info);

    const { cli } = this.coreInstance;
    if (cli && cli.error) {
      cli.error(errObj);
    } else {
      throw new Error(errObj.message);
    }
  }

  debug(...args) {
    if (!this.options.options.V && !this.options.options.verbose) {
      return;
    }
    this.getLog().log('[Verbose] ', ...args);
  }
}
