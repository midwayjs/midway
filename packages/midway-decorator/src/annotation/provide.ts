import 'reflect-metadata';
import { DUPLICATED_INJECTABLE_DECORATOR, TAGGED_CLS, initOrGetObjectDefProps, classNamed } from '../common';
import { ObjectIdentifier, TagClsMetadata } from '../interface';

export function Provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    if (Reflect.hasOwnMetadata(TAGGED_CLS, target)) {
      throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
    }

    if (!identifier) {
      identifier = classNamed(target.name);
    }

    Reflect.defineMetadata(TAGGED_CLS, {
      id: identifier,
      originName: target.name,
    } as TagClsMetadata, target);

    // init property here
    initOrGetObjectDefProps(target);

    return target;
  };
}
