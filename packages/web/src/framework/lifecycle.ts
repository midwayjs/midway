import {
  ILifeCycle,
  IMidwayContainer,
  MidwayConfigService,
  MidwayFrameworkService,
  CONFIGURATION_KEY,
  Init,
  Inject,
  listModule,
  listPreloadModule,
  Provide,
  Scope,
  ScopeEnum,
  FunctionalConfiguration,
} from '@midwayjs/core';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayWebLifeCycleService {
  @Inject()
  protected frameworkService: MidwayFrameworkService;

  @Inject()
  protected configService: MidwayConfigService;

  private lifecycleInstanceList = [];

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    // run lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    debug(`[core]: Found Configuration length = ${cycles.length}`);

    for (const cycle of cycles) {
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        cycle.instance = cycle.target;
      } else {
        // 普通类写法
        debug(`[core]: Lifecycle run ${cycle.target.name} init`);
        cycle.instance = await this.applicationContext.getAsync<ILifeCycle>(
          cycle.target
        );
      }

      if (cycle.instance) {
        this.lifecycleInstanceList.push(cycle);
      }
    }

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
    // cluster 下，onReady 放到 egg willReady 中执行
  }

  public async runReady() {
    // exec onReady()
    await this.runContainerLifeCycle(this.lifecycleInstanceList, 'onReady');
  }

  public async afterInit() {
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

    // some preload module init
    const modules = listPreloadModule();
    for (const module of modules) {
      // preload init context
      await this.applicationContext.getAsync(module);
    }
  }

  public async stop() {
    // stop lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    for (const cycle of cycles) {
      let inst;
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        inst = cycle.target;
      } else {
        inst = await this.applicationContext.getAsync<ILifeCycle>(cycle.target);
      }

      await this.runContainerLifeCycle(inst, 'onStop');
    }

    // stop framework
    await this.frameworkService.stopFramework();
  }

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

  private async runObjectLifeCycle(lifecycleInstanceList, lifecycle) {
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
}
