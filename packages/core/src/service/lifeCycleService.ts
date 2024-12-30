import { ILifeCycle, IMidwayContainer, ScopeEnum } from '../interface';
import {
  CONFIGURATION_KEY,
  CONFIGURATION_OBJECT_KEY,
  DecoratorManager,
  Init,
  Inject,
  Provide,
  Scope,
} from '../decorator';
import { MidwayFrameworkService } from './frameworkService';
import { MidwayConfigService } from './configService';
import { debuglog } from 'util';
import { MidwayMockService } from './mockService';
import { MidwayHealthService } from './healthService';
import { MetadataManager } from '../decorator/metadataManager';
import { MidwayInitializerPerformanceManager } from '../common/performanceManager';
import { createPromiseTimeoutInvokeChain } from '../util/timeout';

const debug = debuglog('midway:debug');

type LifecycleInstanceItem = {
  target: any;
  namespace: string;
  instance?: any;
};

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLifeCycleService {
  @Inject()
  protected frameworkService: MidwayFrameworkService;

  @Inject()
  protected configService: MidwayConfigService;

  @Inject()
  protected mockService: MidwayMockService;

  @Inject()
  protected healthService: MidwayHealthService;

  private lifecycleInstanceList: Array<LifecycleInstanceItem> = [];

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    // exec simulator init
    await this.mockService.initSimulation();

    // run lifecycle
    const cycles = DecoratorManager.listModule(
      CONFIGURATION_KEY
    ) as Array<LifecycleInstanceItem>;

    debug(`[core]: Found Configuration length = ${cycles.length}`);

    for (const cycle of cycles) {
      if (
        MetadataManager.hasOwnMetadata(CONFIGURATION_OBJECT_KEY, cycle.target)
      ) {
        // 函数式写法
        cycle.instance = cycle.target;
      } else {
        // 普通类写法
        debug(`[core]: Lifecycle run ${cycle.namespace} init`);
        cycle.instance = await this.applicationContext.getAsync<ILifeCycle>(
          cycle.target
        );
      }

      cycle.instance && this.lifecycleInstanceList.push(cycle);
    }

    // init health check service
    await this.healthService.init(this.lifecycleInstanceList);

    // bind object lifecycle
    await Promise.all([
      this.runObjectLifeCycle(
        this.lifecycleInstanceList,
        'onBeforeObjectCreated'
      ),
      this.runObjectLifeCycle(this.lifecycleInstanceList, 'onObjectCreated'),
      this.runObjectLifeCycle(this.lifecycleInstanceList, 'onObjectInit'),
      this.runObjectLifeCycle(
        this.lifecycleInstanceList,
        'onBeforeObjectDestroy'
      ),
    ]);

    // bind framework lifecycle
    // onAppError

    // exec onConfigLoad()
    await this.runContainerLifeCycle(
      this.lifecycleInstanceList,
      'onConfigLoad',
      {
        resultHandler: configData => {
          if (configData) {
            this.configService.addObject(configData);
          }
        },
        timeout: this.configService.getConfiguration('core.configLoadTimeout'),
      }
    );

    await this.mockService.runSimulatorSetup();

    // exec onReady()
    await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onReady', {
      timeout: this.configService.getConfiguration('core.readyTimeout'),
    });

    // exec framework.run()
    await this.frameworkService.runFramework();

    // exec onServerReady()
    await this.runContainerLifeCycle(
      this.lifecycleInstanceList,
      'onServerReady',
      {
        timeout: this.configService.getConfiguration('core.serverReadyTimeout'),
      }
    );

    // clear config merge cache
    if (!this.configService.getConfiguration('debug.recordConfigMergeOrder')) {
      this.configService.clearConfigMergeOrder();
    }
  }

  public async stop() {
    await this.mockService.runSimulatorTearDown();
    // stop lifecycle
    await this.runContainerLifeCycle(
      this.lifecycleInstanceList.reverse(),
      'onStop',
      {
        timeout: this.configService.getConfiguration('core.stopTimeout'),
      }
    );
    // stop framework
    await this.frameworkService.stopFramework();
  }

  /**
   * run some lifecycle in configuration
   * @param lifecycleInstanceOrList
   * @param lifecycle
   * @param runOptions
   */
  protected async runContainerLifeCycle(
    lifecycleInstanceOrList: LifecycleInstanceItem[],
    lifecycle: string,
    runOptions?: {
      resultHandler?: (result: any) => void;
      timeout?: number;
    }
  ) {
    await createPromiseTimeoutInvokeChain({
      promiseItems: lifecycleInstanceOrList.map(cycle => {
        return {
          item: async ab => {
            return this.runLifeCycle(cycle, lifecycle, {
              ...runOptions,
              abortController: ab,
            });
          },
          meta: { namespace: cycle.namespace },
          itemName: cycle.namespace,
        };
      }),
      itemTimeout: runOptions?.timeout,
      isConcurrent: false,
      methodName: `configuration.${lifecycle}`,
    });
  }

  private async runLifeCycle(
    cycle: LifecycleInstanceItem,
    lifecycle: string,
    runOptions: {
      resultHandler?: (result: any) => void;
      timeout?: number;
      abortController?: AbortController;
    }
  ): Promise<any> {
    if (typeof cycle.instance[lifecycle] === 'function') {
      debug(
        `[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`
      );
      MidwayInitializerPerformanceManager.lifecycleStart(
        cycle.namespace,
        lifecycle
      );
      const result = await cycle.instance[lifecycle](
        this.applicationContext,
        this.frameworkService.getMainApp(),
        {
          timeout: runOptions.timeout,
          abortController: runOptions.abortController,
        }
      );
      if (runOptions?.resultHandler) {
        runOptions.resultHandler(result);
      }
      MidwayInitializerPerformanceManager.lifecycleEnd(
        cycle.namespace,
        lifecycle
      );
      return result;
    }
  }

  /**
   * run object lifecycle
   * @param lifecycleInstanceList
   * @param lifecycle
   */
  private async runObjectLifeCycle(
    lifecycleInstanceList: any[],
    lifecycle: string
  ) {
    for (const cycle of lifecycleInstanceList) {
      if (typeof cycle.instance[lifecycle] === 'function') {
        debug(
          `[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`
        );
        return await this.applicationContext[lifecycle](
          cycle.instance[lifecycle].bind(cycle.instance)
        );
      }
    }
  }

  public getLifecycleInstanceList() {
    return this.lifecycleInstanceList;
  }
}
