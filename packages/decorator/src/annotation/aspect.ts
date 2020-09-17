import { ASPECT_KEY } from '../common/constant';
import { saveClassMetadata, saveModule } from '../common/decoratorManager';

export interface JoinPoint {
  methodName: string;
  target: any;
  args: any[];
  proceed(...args: any[]): any;
}

export interface AspectMetadata {
  aspectTarget: any[];
  match?: string | (() => boolean);
}

export interface IAspect {
  after?(joinPoint: JoinPoint, result: any, error: Error);
  afterReturn?(joinPoint: JoinPoint, result: any): any;
  afterThrow?(joinPoint: JoinPoint, error: Error): void;
  before?(joinPoint: JoinPoint): void;
  around?(joinPoint: JoinPoint): any;
}

export function Aspect(
  aspectTarget: any | any[],
  match?: string | (() => boolean)
) {
  return function (target) {
    saveModule(ASPECT_KEY, target);
    saveClassMetadata(
      ASPECT_KEY,
      {
        aspectTarget: [].concat(aspectTarget),
        match,
      },
      target
    );
  };
}
