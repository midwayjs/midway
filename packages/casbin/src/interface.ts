import { Adapter, Watcher } from 'casbin';
import { AuthActionVerb, AuthPossession } from './constants';
import { IMidwayContainer, IMidwayContext } from '@midwayjs/core';

export interface CasbinConfigOptions {
  modelPath: string;
  policyAdapter: string | ((applicationContext: IMidwayContainer) => Promise<Adapter>) | Adapter;
  policyWatcher?: ((applicationContext: IMidwayContainer) => Promise<Watcher>) | Watcher;
  usernameFromContext: (ctx: IMidwayContext) => string;
}

export interface Permission {
  resource: string;
  action: AuthActionVerb | CustomAuthActionVerb;
  possession: AuthPossession;
  isOwn?: (ctx: IMidwayContext) => boolean;
}

export type CustomAuthActionVerb = string;
