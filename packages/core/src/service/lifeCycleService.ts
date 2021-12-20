import { ILifeCycle, IMidwayContainer } from '../interface';
import {
  CONFIGURATION_KEY,
  Init,
  Inject,
  listModule,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { FunctionalConfiguration } from '../functional/configuration';
import { MidwayFrameworkService } from './frameworkService';
import { MidwayConfigService } from './configService';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLifeCycleService {
  @Inject()
  protected frameworkService: MidwayFrameworkService;

  @Inject()
  protected configService: MidwayConfigService;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    // run lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    debug(`[core]: Found Configuration length = ${cycles.length}`);

    const lifecycleInstanceList = [];
    for (const cycle of cycles) {
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        cycle.instance = cycle.target;
      } else {
        // 普通类写法
        debug(`[core]: run ${cycle.target.name} init`);
        cycle.instance = await this.applicationContext.getAsync<ILifeCycle>(
          cycle.target
        );
      }

      cycle.instance && lifecycleInstanceList.push(cycle);
    }

    // bind object lifecycle
    await Promise.all([
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectCreated'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onObjectInit'),
      this.runObjectLifeCycle(lifecycleInstanceList, 'onBeforeObjectDestroy'),
    ]);

    // bind framework lifecycle
    // onAppError

    // exec onConfigLoad()
    await this.runContainerLifeCycle(
      lifecycleInstanceList,
      'onConfigLoad',
      configData => {
        if (configData) {
          this.configService.addObject(configData);
        }
      }
    );

    // exec onReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onReady');

    // exec framework.run()
    await this.frameworkService.runFramework();

    // exec onServerReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onServerReady');
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
          debug(`[core]: run ${cycle.instance.constructor.name} ${lifecycle}`);
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
          `[core]: run ${lifecycleInstanceOrList.constructor.name} ${lifecycle}`
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
        debug(`[core]: run ${cycle.instance.constructor.name} ${lifecycle}`);
        return this.applicationContext[lifecycle](
          cycle.instance[lifecycle].bind(cycle.instance)
        );
      }
    }
  }
}
