
import { IServerless, IServerlessOptions, ICommandObject, ICommand, IHooks, IConfig, Ilayer } from '../interface/midwayServerless';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { render } from 'ejs';
import { formatLayers } from './utils';
const pkgJsonPath = join(__dirname, '../../package.json');
export class ProviderBase {

  static isProvider = true;
  public provider: any;
  serverless: IServerless;
  options: IServerlessOptions;
  commands: ICommand;
  hooks: IHooks;
  servicePath: string;
  midwayBuildPath: string;
  packageJson: any = {};

  constructor(serverless: IServerless, options: IServerlessOptions) {
    this.serverless = serverless;
    this.options = options;
    this.commands = {};
    this.hooks = {};
    this.servicePath = this.serverless.config.servicePath;
    this.midwayBuildPath = join(this.servicePath, '.serverless');
    if (existsSync(pkgJsonPath)) {
      this.packageJson = require(pkgJsonPath);
    }
  }

  protected bindCommand(cmdObj: any, link?: any): IConfig {
    const processedInput = this.serverless.processedInput && this.serverless.processedInput.commands || [];
    const cmdList = Object.keys(cmdObj).filter(cmd => {
      if (link[cmd]) { // 关联命令 比如 deploy关联着package
        const linkRes = link[cmd].find(cmd => {
          return processedInput.indexOf(cmd) !== -1;
        });
        if (linkRes) {
          return true;
        }
      }
      return processedInput.indexOf(cmd) !== -1;
    });

    const commandList: ICommand[] = [];
    const hooksList: IHooks[] = [];
    cmdList.forEach((cmd: string) => {
      const commandObj: ICommandObject = cmdObj[cmd];
      if (commandObj.getCommand) {
        commandList.push(commandObj.getCommand());
      }
      if (commandObj.getHooks) {
        hooksList.push(commandObj.getHooks());
      }
    });
    return {
      commands: Object.assign({}, ...commandList),
      hooks: Object.assign({}, ...hooksList)
    };
  }

  async loadWrapper(WrapperContent: string) {
    const files = {};
    const functions = this.serverless.service.functions || {};
    for (const func in functions) {
      const handlerConf = functions[func];
      if (handlerConf._ignore) {
        continue;
      }
      const [handlerFileName, name] = handlerConf.handler.split('.');
      if (!files[handlerFileName]) {
        files[handlerFileName] = {
          handlers: [],
          originLayers: []
        };
      }
      if (handlerConf.layers && handlerConf.layers.length) {
        files[handlerFileName].originLayers.push(handlerConf.layers);
      }
      // 高密度部署
      if (handlerConf._isAggregation && handlerConf.functions) {
        files[handlerFileName].handlers.push({
          name,
          handlers: handlerConf._handlers,
        });
      } else {
        files[handlerFileName].handlers.push({
          name,
          handler: handlerConf.handler
        });
      }
    }

    for (const file in files) {
      const fileName = join(this.midwayBuildPath, `${file}.js`);
      const layers = this.getLayers(this.serverless.service.layers, ...files[file].originLayers);
      const content = this.writeCodeToFile(WrapperContent, {
        handlers: files[file].handlers,
        ...layers
      });
      writeFileSync(fileName, content);
    }
  }

  private writeCodeToFile(WrapperContent, options) {
    return render(WrapperContent, options);
  }

  private getLayers(...layersList: Ilayer[]) {
    const layerTypeList = formatLayers(...layersList);
    const layerDeps = [];
    const layers = [];

    if (layerTypeList && layerTypeList.npm) {
      Object.keys(layerTypeList.npm).forEach((originName: string) => {
        const name = 'layer_' + originName;
        layerDeps.push({ name, path: layerTypeList.npm[originName] });
        layers.push(name);
      });
    }
    return {
      layerDeps,
      layers
    };
  }

  async callCommand(command: string, options?: any) {
    if (options) {
      Object.keys(options).forEach(option => {
        this.serverless.processedInput.options[option] = options[option];
      });
    }
    return this.serverless.pluginManager.invoke.call(this.serverless.pluginManager, [command], true);
  }

  getNotIgnoreFunc() {
    const func = {};
    for (const funcName in this.serverless.service.functions) {
      const funcConf = this.serverless.service.functions[funcName];
      if (funcConf._ignore) {
        continue;
      }
      func[funcName] = funcConf;
    }
    return func;
  }

  getSpecJson(coverOptions?: any) {
    const service = this.serverless.service;
    if (coverOptions) {
      Object.keys(coverOptions).forEach((key: string) => {
        if (!service[key]) {
          service[key] = {};
        }
        Object.assign(service[key], coverOptions[key]);
      });
    }
    return {
      custom: service.custom,
      service: service.service,
      provider: service.provider,
      functions: this.getNotIgnoreFunc(),
      resources: service.resources,
      package: service.package,
    };
  }

  setGolbalDependencies(name: string, version?: string) {
    if (!this.serverless.service.globalDependencies) {
      this.serverless.service.globalDependencies = {};
    }
    this.serverless.service.globalDependencies[name] = version || this.packageJson.version || '*';
  }
}
