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
  static patchInject(instance: any, context: IApplicationContext) {
    if (instance.__patched_inject__) {
      return;
    }
    // 遍历 this.xxx = inject('xxx') 这样的属性
    let patched = false;
    _.forOwn(instance, (v, k) => {
      if (v instanceof InjectionPoint) {
        patched = true;
        Object.defineProperty(instance, k, {
          get: () => {
            let value = v.defaultValue;
            try {
              value = context.get(v.id || k);
            } catch (e) {
              if (e.message.indexOf('is not valid in current context') === -1) {
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
    });

    if (patched) {
      instance.__patched_inject__ = true;
    }
  }
  /**
   * 自动装配 this.xxx = null;
   * @param instance 实例对象
   * @param context ApplicationContext
   * @param fn handle function
   */
  static patchNoDollar(instance: any, context: IApplicationContext, fn?: any) {
    if (instance.__patched_no_dollar__) {
      return;
    }

    let patched = false;
    _.forOwn(instance, (v, k) => {
      if (v === null && k[0] !== '$') {
        patched = true;
        Object.defineProperty(instance, k, {
          get: () => {
            if (fn && typeof fn === 'function') {
              return fn(k);
            }
            return context.get(k);
          },
          configurable: false,
          enumerable: true
        });
      }
    });

    if (patched) {
      instance.__patched_no_dollar__ = true;
    }
  }
  /**
   * 自动装配 this.$xxx = null
   * 插件、logger
   * @param instance 实例对象
   * @param context ApplicationContext
   * @param fn handle function
   */
  static patchDollar(instance: any, context: IApplicationContext, fn?: any) {
    if (instance.__patched_dollar__) {
      return;
    }

    let patched = false;
    _.forOwn(instance, (v, k) => {
      if (v === null && k[0] === '$') {
        patched = true;
        Object.defineProperty(instance, k, {
          get: () => {
            let kk = k.slice(1);
            if (fn && typeof fn === 'function') {
              return fn(kk);
            }
            return context.get(kk);
          },
          configurable: false,
          enumerable: true
        });
      }
    });

    if (patched) {
      instance.__patched_dollar__ = true;
    }
  }
}
