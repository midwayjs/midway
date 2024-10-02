import { CommonGuardUnion, ScopeEnum } from '../../interface';
import { GUARD_KEY } from '../constant';
import { Provide } from './provide';
import { Scope } from './objectDef';
import { MetadataManager } from '../metadataManager';

export function UseGuard(
  guardOrArr: CommonGuardUnion
): ClassDecorator & MethodDecorator {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    if (!Array.isArray(guardOrArr)) {
      guardOrArr = [guardOrArr];
    }
    MetadataManager.defineMetadata(GUARD_KEY, guardOrArr, target, propertyKey);
  };
}

export function Guard(): ClassDecorator {
  return target => {
    Provide()(target);
    Scope(ScopeEnum.Singleton)(target);
  };
}
