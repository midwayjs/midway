/**
 * 自动装配补丁
 * 遍历实例对象中 this.xx = null; 的属性
 * 或者是 this.xxx = inject('xxx'); 的属性
 * 调用时进行自动装配
 */

import * as _ from 'lodash';
import { IApplicationContext } from '../../interfaces';

export class InjectionPoint {
  defaultValue: any;
  id: string;

  constructor(id: string, defaultValue: any) {
    this.id = id;
    this.defaultValue = defaultValue;
  }

  static create(id: string, defaultValue?: any) {
    return new InjectionPoint(id, defaultValue);
  }
}

export class Autowire {
  patch(instance: any, context: IApplicationContext) {
    // 遍历 this.xxx = inject('xxx') 这样的属性
    _.forOwn(instance, (v, k) => {
      if (v instanceof InjectionPoint) {
        Object.defineProperty(instance, k, {
          get: () => {
            let value = v.defaultValue;
            try {
              value = context.get(v.id || k);
            } catch (e) {
              if (e.message.indexOf('should be an known identifier') === -1) {
                throw e;
              }
            }
            return value;
          },
          configurable: false,
          enumerable: true
        });
        return;
      }
      // 遍历 this.xx = null; 这样的属性
      if (v === null) {
        Object.defineProperty(instance, k, {
          get: () => context.get(k),
          configurable: false,
          enumerable: true
        });
      }
    });
  }
}
