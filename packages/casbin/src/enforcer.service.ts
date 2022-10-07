import { newEnforcer, Enforcer, Adapter } from 'casbin';
import {
  ApplicationContext,
  Config,
  delegateTargetAllPrototypeMethod,
  IMidwayContainer,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { CasbinConfigOptions } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class CasbinAdapterManager {
  private defaultAdapter: Adapter;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  setAdapter(adapter: Adapter) {
    this.defaultAdapter = adapter;
  }

  getAdapter() {
    return this.defaultAdapter;
  }
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class CasbinEnforcerService {
  private instance: Enforcer;

  @Config('casbin')
  casbinConfig: CasbinConfigOptions;

  @Inject()
  adapterManager: CasbinAdapterManager;

  @Init()
  async init() {
    this.instance = await newEnforcer(
      this.casbinConfig.modelPath,
      this.adapterManager.getAdapter() || this.casbinConfig.policyAdapter
    );
  }

  getEnforcer(): Enforcer {
    return this.instance;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CasbinEnforcerService extends Enforcer {
  // empty
}

delegateTargetAllPrototypeMethod(CasbinEnforcerService, [Enforcer]);
