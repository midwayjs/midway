import { ASPECT_KEY, attachClassMetadata, saveModule, ScopeEnum } from '..';
import { Scope } from './objectDef';

export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed?(...args: any[]): any;
}

export interface AspectMetadata {
  aspectTarget: any;
  match?: string | (() => boolean);
  priority?: number;
}

export interface IMethodAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}

export function Aspect(
  aspectTarget: any | any[],
  match?: string | (() => boolean),
  priority?: number
) {
  return function (target) {
    saveModule(ASPECT_KEY, target);
    const aspectTargets = [].concat(aspectTarget);
    for (const aspectTarget of aspectTargets) {
      attachClassMetadata(
        ASPECT_KEY,
        {
          aspectTarget,
          match,
          priority,
        },
        target
      );
    }

    Scope(ScopeEnum.Singleton);
  };
}
