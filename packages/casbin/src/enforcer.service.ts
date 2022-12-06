import { newEnforcer, Enforcer } from 'casbin';
import {
  ApplicationContext,
  Config,
  delegateTargetAllPrototypeMethod,
  IMidwayContainer,
  Init,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { CasbinConfigOptions } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class CasbinEnforcerService {
  private instance: Enforcer;

  @Config('casbin')
  protected casbinConfig: CasbinConfigOptions;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Init()
  protected async init() {
    if (typeof this.casbinConfig.policyAdapter === 'function') {
      this.casbinConfig.policyAdapter = await this.casbinConfig.policyAdapter(
        this.applicationContext
      );
    }

    if (typeof this.casbinConfig.policyWatcher === 'function') {
      this.casbinConfig.policyWatcher = await this.casbinConfig.policyWatcher(
        this.applicationContext
      );
    }

    this.instance = await newEnforcer(
      this.casbinConfig.modelPath,
      this.casbinConfig.policyAdapter
    );

    if (this.casbinConfig.policyWatcher) {
      this.instance.setWatcher(this.casbinConfig.policyWatcher);
    }
  }

  public getEnforcer(): Enforcer {
    return this.instance;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CasbinEnforcerService extends Enforcer {
  // empty
}

delegateTargetAllPrototypeMethod(CasbinEnforcerService, Enforcer);
