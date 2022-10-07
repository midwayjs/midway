import { Permission } from './interface';
import { PERMISSIONS_METADATA_KEY } from './constants';
import { IMidwayContext, savePropertyMetadata } from '@midwayjs/core';

const defaultIsOwn = (ctx: IMidwayContext): boolean => false;

/**
 * You can define multiple permissions, but only
 * when all of them satisfied, could you access the route.
 */
export function UsePermission(...permissions: Permission[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    const perms = permissions.map(item => {
      if (!item.isOwn) {
        item.isOwn = defaultIsOwn;
      }
      return item;
    });

    savePropertyMetadata(PERMISSIONS_METADATA_KEY, perms, target, propertyKey);
  };
}
