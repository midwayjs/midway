import { saveClassMetadata, savePropertyMetadata } from '../decoratorManager';
import { CommonGuardUnion } from '../../interface';
import { GUARD_KEY } from '../constant';

export function UseGuard(guardOrArr: CommonGuardUnion): ClassDecorator | MethodDecorator {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (!Array.isArray(guardOrArr)) {
      guardOrArr = [guardOrArr];
    }
    if (propertyKey) {
      saveClassMetadata(GUARD_KEY, guardOrArr, target);
    } else {
      savePropertyMetadata(GUARD_KEY, guardOrArr, target, propertyKey);
    }
  };
}
