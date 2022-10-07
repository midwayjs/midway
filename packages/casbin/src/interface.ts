import { Adapter } from 'casbin';
import { AuthActionVerb, AuthPossession } from './constants';
import { IMidwayContext } from '@midwayjs/core';

export interface CasbinConfigOptions {
  modelPath: string;
  policyAdapter: string | Adapter;
  usernameFromContext: (ctx: IMidwayContext) => string;
}

export interface Permission {
  resource: string;
  action: AuthActionVerb | CustomAuthActionVerb;
  possession: AuthPossession;
  isOwn?: (ctx: IMidwayContext) => boolean;
}

export type CustomAuthActionVerb = string;
