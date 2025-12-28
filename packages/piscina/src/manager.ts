import {
  Config,
  Init,
  Logger,
  ServiceFactory,
  ILogger,
  MidwayCommonError,
  Inject,
  delegateTargetAllPrototypeMethod,
  Singleton,
  MidwayEnvironmentService,
} from '@midwayjs/core';
import { Piscina } from 'piscina';
import { join } from 'path';
import { PiscinaConfig, PiscinaPoolConfig } from './interface';

/**
 * Midway 扩展的 Piscina 类
 * 继承了原生 Piscina 的所有功能，并添加了 Midway 容器相关方法
 */
export class MidwayPiscina extends Piscina {
  /**
   * 在 Worker 中的 Midway 容器中执行 @PiscinaTask 装饰器任务
   * @param handler 任务的 handler 名称（对应 @PiscinaTask 装饰器参数）
   * @param payload 传递给任务的参数
   * @param options Piscina 运行选项（transferList, signal 等）
   */
  runInContainer<T = any, R = any>(
    handler: string,
    payload?: T,
    options?: Parameters<Piscina['run']>[1]
  ): Promise<R> {
    return this.run(
      {
        handler: 'defineConfiguration',
        payload: {
          handler,
          data: payload,
        },
      },
      options
    );
  }
}

@Singleton()
export class PiscinaServiceFactory extends ServiceFactory<MidwayPiscina> {
  @Config('piscina')
  protected config: PiscinaConfig;

  @Logger('coreLogger')
  protected logger: ILogger;

  @Inject('appDir')
  protected appDir;

  @Inject()
  protected environmentService: MidwayEnvironmentService;

  @Init()
  protected async init() {
    await this.initClients(this.config, {
      concurrent: true,
    });
  }

  protected async createClient(
    config: PiscinaPoolConfig,
    name: string
  ): Promise<MidwayPiscina> {
    const { workerFile, ...piscinaOptions } = config;

    if (!workerFile) {
      throw new MidwayCommonError(
        `[midway:piscina] client(${name}) 'workerFile' is required`
      );
    }

    const pool = new MidwayPiscina({
      ...piscinaOptions,
      filename: join(__dirname, 'worker-bootstrap.js'),
      workerData: {
        _fullPath: workerFile,
        _mainAppDir: this.appDir,
        _isDevelopmentEnvironment:
          this.environmentService.isDevelopmentEnvironment(),
        ...piscinaOptions.workerData,
      },
    });

    this.logger.info(
      `[midway:piscina] pool(${name}) created with worker: ${workerFile}`
    );

    return pool;
  }

  getName() {
    return 'piscina';
  }

  protected async destroyClient(pool: MidwayPiscina, name: string) {
    try {
      if (pool) {
        await pool.destroy();
        this.logger.info(`[midway:piscina] pool(${name}) destroyed`);
      }
    } catch (error) {
      this.logger.error(
        `[midway:piscina] pool(${name}) destroy failed.`,
        error
      );
    }
  }
}

@Singleton()
export class PiscinaService implements MidwayPiscina {
  @Inject()
  private serviceFactory: PiscinaServiceFactory;

  private instance: MidwayPiscina;

  @Init()
  async init() {
    this.instance = this.serviceFactory.get(
      this.serviceFactory.getDefaultClientName?.() || 'default'
    );
    if (!this.instance) {
      throw new MidwayCommonError('piscina default instance not found.');
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PiscinaService extends MidwayPiscina {
  // empty
}

delegateTargetAllPrototypeMethod(PiscinaService, MidwayPiscina);
