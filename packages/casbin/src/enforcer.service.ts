import { newEnforcer, Enforcer, Adapter } from 'casbin';
import {
  ApplicationContext,
  Config,
  delegateTargetAllPrototypeMethod,
  IMidwayContainer,
  Init,
  Provide,
  Scope,
  ScopeEnum
} from '@midwayjs/core';
import { CasbinConfigOptions } from './interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class CasbinAdapterManager {
  private defaultAdapter: Adapter;

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Init()
  async init() {

  }

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

  @ApplicationContext()
  applicationContext: IMidwayContainer;

  @Init()
  async init() {
    this.instance = await newEnforcer(this.casbinConfig.modelPath, this.casbinConfig.policyAdapter);
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
