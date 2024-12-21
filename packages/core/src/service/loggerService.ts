import { Provide, Scope, Inject, Init } from '../decorator';
import { MidwayConfigService } from './configService';
import { ServiceFactory } from '../common/serviceFactory';
import {
  ILogger,
  IMidwayContainer,
  IMidwayContext,
  MidwayLoggerOptions,
  ScopeEnum,
} from '../interface';
import {
  DefaultConsoleLoggerFactory,
  LoggerFactory,
} from '../common/loggerFactory';
import { MidwayFeatureNoLongerSupportedError } from '../error';
import { extend } from '../util/extend';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLoggerService extends ServiceFactory<ILogger> {
  @Inject()
  public configService: MidwayConfigService;

  private loggerFactory: LoggerFactory<any, any>;

  private lazyLoggerConfigMap: Map<string, any> = new Map();

  private aliasLoggerMap: Map<string, string> = new Map();

  constructor(
    readonly applicationContext: IMidwayContainer,
    readonly globalOptions = {}
  ) {
    super();
  }

  @Init()
  protected async init() {
    const loggerFactory = this.configService.getConfiguration('loggerFactory');

    // load logger factory from user config first
    this.loggerFactory =
      loggerFactory ||
      this.globalOptions['loggerFactory'] ||
      new DefaultConsoleLoggerFactory();

    // check
    if (!this.loggerFactory.getDefaultMidwayLoggerConfig) {
      throw new MidwayFeatureNoLongerSupportedError(
        'please upgrade your @midwayjs/logger to latest version'
      );
    }

    const defaultLoggerConfig = this.loggerFactory.getDefaultMidwayLoggerConfig(
      this.configService.getAppInfo()
    );

    // merge to user config
    this.configService.addObject(defaultLoggerConfig, true);

    // init logger
    await this.initClients(this.configService.getConfiguration('midwayLogger'));
    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  /**
   * just for egg
   */
  public initSync() {
    const loggerFactory = this.configService.getConfiguration('loggerFactory');

    // load logger factory from user config first
    this.loggerFactory =
      loggerFactory ||
      this.globalOptions['loggerFactory'] ||
      new DefaultConsoleLoggerFactory();

    // check
    if (!this.loggerFactory.getDefaultMidwayLoggerConfig) {
      throw new MidwayFeatureNoLongerSupportedError(
        'please upgrade your @midwayjs/logger to latest version'
      );
    }

    const defaultLoggerConfig = this.loggerFactory.getDefaultMidwayLoggerConfig(
      this.configService.getAppInfo()
    );

    // merge to user config
    this.configService.addObject(defaultLoggerConfig, true);

    // init logger
    const options = this.configService.getConfiguration('midwayLogger');
    this.options = options;

    // merge options.client to options.clients['default']
    if (options.client) {
      options.clients = options.clients || {};
      options.clients['default'] = options.clients['default'] || {};
      extend(true, options.clients['default'], options.client);
    }

    // multi client
    if (options.clients) {
      for (const id of Object.keys(options.clients)) {
        const newConfig = extend(
          true,
          {},
          options['default'],
          options.clients[id]
        );
        this.createClient(newConfig, id);
      }
    }

    // set priority
    this.clientPriority = options.priority || {};

    // alias inject logger
    this.applicationContext?.registerObject(
      'logger',
      this.getLogger('appLogger')
    );
  }

  protected createClient(config, name?: string) {
    if (config.aliasName) {
      // mapping alias logger name to real logger name
      this.aliasLoggerMap.set(config.aliasName, name);
    }
    if (!config.lazyLoad) {
      this.loggerFactory.createLogger(name, config);
    } else {
      delete config['lazyLoad'];
      this.lazyLoggerConfigMap.set(name, config);
    }
  }

  getName() {
    return 'logger';
  }

  public createLogger(name: string, config: MidwayLoggerOptions) {
    delete config['aliasName'];
    return this.loggerFactory.createLogger(name, config);
  }

  public getLogger(name: string) {
    if (this.aliasLoggerMap.has(name)) {
      // get real logger name
      name = this.aliasLoggerMap.get(name);
    }
    const logger = this.loggerFactory.getLogger(name);
    if (logger) {
      return logger;
    }

    if (this.lazyLoggerConfigMap.has(name)) {
      // try to lazy init
      this.createClient(this.lazyLoggerConfigMap.get(name), name);
      this.lazyLoggerConfigMap.delete(name);
    }
    return this.loggerFactory.getLogger(name);
  }

  public getCurrentLoggerFactory(): LoggerFactory<any, any> {
    return this.loggerFactory;
  }

  public createContextLogger(
    ctx: IMidwayContext,
    appLogger: ILogger,
    contextOptions?: any
  ) {
    return this.loggerFactory.createContextLogger(
      ctx,
      appLogger,
      contextOptions
    );
  }

  public getClients() {
    return this.clients;
  }

  public getClientKeys() {
    return Array.from(this.clients.keys());
  }
}
