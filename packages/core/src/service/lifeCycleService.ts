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
const debug = debuglog('midway:debug');

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

  private lifecycleInstanceList: Array<{
    target: any;
    namespace: string;
    instance?: any;
  }> = [];

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    // exec simulator init
    await this.mockService.initSimulation();

    // run lifecycle
    const cycles = DecoratorManager.listModule(CONFIGURATION_KEY) as Array<{
      target: any;
      namespace: string;
      instance?: any;
    }>;

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
      configData => {
        if (configData) {
          this.configService.addObject(configData);
        }
      }
    );

    await this.mockService.runSimulatorSetup();

    // exec onReady()
    await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onReady');

    // exec framework.run()
    await this.frameworkService.runFramework();

    // exec onServerReady()
    await this.runContainerLifeCycle(
      this.lifecycleInstanceList,
      'onServerReady'
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
      'onStop'
    );
    // stop framework
    await this.frameworkService.stopFramework();
  }

  /**
   * run some lifecycle in configuration
   * @param lifecycleInstanceOrList
   * @param lifecycle
   * @param resultHandler
   */
  private async runContainerLifeCycle(
    lifecycleInstanceOrList,
    lifecycle,
    resultHandler?: (result: any) => void
  ) {
    if (Array.isArray(lifecycleInstanceOrList)) {
      for (const cycle of lifecycleInstanceOrList) {
        if (typeof cycle.instance[lifecycle] === 'function') {
          debug(
            `[core]: Lifecycle run ${cycle.instance.constructor.name} ${lifecycle}`
          );
          const result = await cycle.instance[lifecycle](
            this.applicationContext,
            this.frameworkService.getMainApp()
          );
          if (resultHandler) {
            resultHandler(result);
          }
        }
      }
    } else {
      if (typeof lifecycleInstanceOrList[lifecycle] === 'function') {
        debug(
          `[core]: Lifecycle run ${lifecycleInstanceOrList.constructor.name} ${lifecycle}`
        );
        const result = await lifecycleInstanceOrList[lifecycle](
          this.applicationContext,
          this.frameworkService.getMainApp()
        );
        if (resultHandler) {
          resultHandler(result);
        }
      }
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
        return this.applicationContext[lifecycle](
          cycle.instance[lifecycle].bind(cycle.instance)
        );
      }
    }
  }

  public getLifecycleInstanceList() {
    return this.lifecycleInstanceList;
  }
}
