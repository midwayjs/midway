import 'reflect-metadata';
import {DUPLICATED_INJECTABLE_DECORATOR} from '../utils/errMsg';
import { initOrGetObjectDefProps, TAGGED_CLS } from '..';
import {ObjectIdentifier, TagClsMetadata} from '../interfaces';

const camelCase = require('camelcase');

function provide(identifier?: ObjectIdentifier) {
  return function (target: any) {
    if (Reflect.hasOwnMetadata(TAGGED_CLS, target)) {
      throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
    }

    if (!identifier) {
      identifier = camelCase(target.name);
    }

    Reflect.defineMetadata(TAGGED_CLS, <TagClsMetadata> {
      id: identifier,
      originName: target.name,
    }, target);

    // init property here
    initOrGetObjectDefProps(target);

    return target;
  };
}

export {provide};
