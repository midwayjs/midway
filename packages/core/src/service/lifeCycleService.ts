import { ILifeCycle, IMidwayApplication, IMidwayContainer } from '../interface';
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

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayLifeCycleService {
  @Inject()
  frameworkService: MidwayFrameworkService;

  @Inject()
  configService: MidwayConfigService;

  mainApp: IMidwayApplication;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  async init() {
    this.mainApp = this.frameworkService.getMainApp();

    // run lifecycle
    const cycles = listModule(CONFIGURATION_KEY);

    const lifecycleInstanceList = [];
    for (const cycle of cycles) {
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        cycle.instance = cycle.target;
      } else {
        // 普通类写法
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

    // exec onServerReady()
    await this.runContainerLifeCycle(lifecycleInstanceList, 'onServerReady');
  }

  async stop() {
    const cycles = listModule(CONFIGURATION_KEY);
    for (const cycle of cycles) {
      let inst;
      if (cycle.target instanceof FunctionalConfiguration) {
        // 函数式写法
        inst = cycle.target;
      } else {
        inst = await this.applicationContext.getAsync<ILifeCycle>(cycle.target);
      }

      if (inst?.onStop && typeof inst.onStop === 'function') {
        await inst.onStop(this.applicationContext, this.mainApp);
      }
    }
  }

  private async runContainerLifeCycle(
    lifecycleInstanceList,
    lifecycle,
    resultHandler?: (result: any) => void
  ) {
    for (const cycle of lifecycleInstanceList) {
      if (typeof cycle.instance[lifecycle] === 'function') {
        const result = await cycle.instance[lifecycle](
          this.applicationContext,
          this.mainApp
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
        await this.applicationContext[lifecycle](cycle.instance[lifecycle]);
      }
    }
  }
}
