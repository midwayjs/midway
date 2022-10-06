import { saveClassMetadata, savePropertyMetadata } from '../decoratorManager';
import { CommonGuardUnion } from '../../interface';
import { GUARD_KEY } from '../constant';
import { Provide } from './provide';
import { Scope } from './objectDef';
import { ScopeEnum } from '../interface';

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
    if (propertyKey) {
      savePropertyMetadata(GUARD_KEY, guardOrArr, target, propertyKey);
    } else {
      saveClassMetadata(GUARD_KEY, guardOrArr, target);
    }
  };
}

export function Guard(): ClassDecorator {
  return target => {
    Provide()(target);
    Scope(ScopeEnum.Singleton)(target);
  };
}
