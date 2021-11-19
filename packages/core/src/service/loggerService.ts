import { Provide, Scope, ScopeEnum, Inject, Init } from '@midwayjs/decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../util/serviceFactory';
import { ILogger, loggers } from '@midwayjs/logger';
import { IMidwayContainer } from '../interface';

const levelTransform = level => {
  if (!level) {
    return undefined;
  }
  switch (level) {
    case 'NONE':
    case Infinity: // egg logger 的 none 是这个等级
      return null;
    case 0:
    case 'DEBUG':
    case 'debug':
      return 'debug';
    case 1:
    case 'INFO':
    case 'info':
      return 'info';
    case 2:
    case 'WARN':
    case 'warn':
      return 'warn';
    case 3:
    case 'ERROR':
    case 'error':
      return 'error';
    default:
      return 'silly';
  }
};

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  public configService: MidwayConfigService;

  constructor(readonly applicationContext: IMidwayContainer) {
    super();
  }

  @Init()
  protected async init() {
    const eggLoggerConfig = this.transformEggConfig();
    if (eggLoggerConfig) {
      this.configService.addObject(eggLoggerConfig);
    }

    await this.initClients(this.configService.getConfiguration('midwayLogger'));
    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  transformEggConfig() {
    if (this.configService.getConfiguration('customLogger')) {
      // use egg module
      return this.transformEggLogger(this.configService.getConfiguration());
    } else {
      // it will be use other logger
      return;
    }
  }

  protected async createClient(config, name?: string) {
    loggers.createLogger(name, config);
  }

  getName() {
    return 'logger';
  }

  createLogger(name, config) {
    return loggers.createLogger(name, config);
  }

  getLogger(name: string) {
    return loggers.getLogger(name);
  }

  transformEggLogger(options) {
    const transformLoggerConfig = {
      midwayLogger: {
        default: {},
        clients: {},
      },
    };

    if (options.midwayLogger && !options.midwayLogger.default) {
      transformLoggerConfig.midwayLogger.default = {
        dir: options.logger.dir,
        level: levelTransform(options.logger.level),
        consoleLevel: levelTransform(options.logger.consoleLevel),
      };
    }

    const eggCustomLogger = options['customLogger'];

    for (const name in eggCustomLogger) {
      transformLoggerConfig.midwayLogger.clients[name] = {
        fileLogName: eggCustomLogger[name]?.file,
        level: levelTransform(eggCustomLogger[name]?.level),
        consoleLevel: levelTransform(eggCustomLogger[name]?.consoleLevel),
      };
      cleanUndefinedProperty(transformLoggerConfig.midwayLogger.clients[name]);
    }
    return transformLoggerConfig;
  }
}

function cleanUndefinedProperty(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
}
