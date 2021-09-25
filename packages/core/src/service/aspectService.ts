import {
  ASPECT_KEY,
  AspectMetadata,
  getClassMetadata,
  IMethodAspect,
  isAsyncFunction,
  listModule,
  isClass,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import * as pm from 'picomatch';
import { IAspectService, IMidwayContainer } from '../interface';
import * as util from 'util';

const debugLogger = util.debuglog('midway:container:aspect');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayAspectService implements IAspectService {
  protected aspectMappingMap: WeakMap<any, Map<string, any[]>>;
  private aspectModuleSet: Set<any>;
  private container: IMidwayContainer;

  constructor(container) {
    this.container = container;
    this.aspectMappingMap = new WeakMap();
    this.aspectModuleSet = new Set();
  }
  /**
   * load aspect method for container
   * @private
   */
  public async loadAspect() {
    // for aop implementation
    const aspectModules = listModule(ASPECT_KEY);
    // sort for aspect target
    let aspectDataList = [];
    for (const module of aspectModules) {
      const data = getClassMetadata(ASPECT_KEY, module);
      aspectDataList = aspectDataList.concat(
        data.map(el => {
          el.aspectModule = module;
          return el;
        })
      );
    }

    // sort priority
    aspectDataList.sort((pre, next) => {
      return (next.priority || 0) - (pre.priority || 0);
    });

    for (const aspectData of aspectDataList) {
      const aspectIns = await this.container.getAsync<IMethodAspect>(
        aspectData.aspectModule
      );
      await this.addAspect(aspectIns, aspectData);
    }

    // 合并拦截器方法，提升性能
    for (const module of this.aspectModuleSet) {
      const aspectMapping = this.aspectMappingMap.get(module);
      for (const [method, aspectFn] of aspectMapping) {
        const composeFn = (ins, originMethod) => {
          for (const fn of aspectFn) {
            originMethod = fn(ins, originMethod);
          }
          return originMethod;
        };
        aspectMapping.set(method, [composeFn]);
      }
    }
    // 绑定完后清理 Set 记录
    this.aspectModuleSet.clear();
  }

  public async addAspect(aspectIns: IMethodAspect, aspectData: AspectMetadata) {
    const module = aspectData.aspectTarget;
    const names = Object.getOwnPropertyNames(module.prototype);
    const isMatch = aspectData.match ? pm(aspectData.match) : () => true;

    // 存到 set 里用来做循环
    this.aspectModuleSet.add(module);

    /**
     * 拦截器流程
     * 1、在每个被拦截的 class 上做拦截标记，记录哪些方法需要被拦截
     * 2、Container 保存每个 class 的方法对应的拦截器数组
     * 3、创建完实例后，在返回前执行包裹逻辑，把需要拦截的方法都执行一遍拦截（不对原型做修改）
     */

    for (const name of names) {
      if (name === 'constructor' || !isMatch(name)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        module.prototype,
        name
      );
      if (!descriptor || descriptor.writable === false) {
        continue;
      }

      // 把拦截器和当前容器绑定
      if (!this.aspectMappingMap.has(module)) {
        this.aspectMappingMap.set(module, new Map());
      }

      const mappingMap = this.aspectMappingMap.get(module);
      if (!mappingMap.has(name)) {
        mappingMap.set(name, []);
      }
      // 把拦截器本身加到数组中
      const methodAspectCollection = mappingMap.get(name);

      if (isAsyncFunction(descriptor.value)) {
        debugLogger(
          `aspect [#${module.name}:${name}], isAsync=true, aspect class=[${aspectIns.constructor.name}]`
        );

        const fn = (ins, originMethod) => {
          return async (...args) => {
            let error, result;
            const newProceed = (...args) => {
              return originMethod.apply(ins, args);
            };
            const joinPoint = {
              methodName: name,
              target: ins,
              args: args,
              proceed: newProceed,
            };
            try {
              await aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = await aspectIns.around(joinPoint);
              } else {
                result = await originMethod.apply(ins, joinPoint.args);
              }
              joinPoint.proceed = undefined;
              const resultTemp = await aspectIns.afterReturn?.(
                joinPoint,
                result
              );
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              return result;
            } catch (err) {
              joinPoint.proceed = undefined;
              error = err;
              if (aspectIns.afterThrow) {
                await aspectIns.afterThrow(joinPoint, error);
              } else {
                throw err;
              }
            } finally {
              await aspectIns.after?.(joinPoint, result, error);
            }
          };
        };

        methodAspectCollection.push(fn);
      } else {
        debugLogger(
          `aspect [#${module.name}:${name}], isAsync=false, aspect class=[${aspectIns.constructor.name}]`
        );
        const fn = (ins, originMethod) => {
          return (...args) => {
            let error, result;
            const newProceed = (...args) => {
              return originMethod.apply(ins, args);
            };
            const joinPoint = {
              methodName: name,
              target: ins,
              args: args,
              proceed: newProceed,
            };
            try {
              aspectIns.before?.(joinPoint);
              if (aspectIns.around) {
                result = aspectIns.around(joinPoint);
              } else {
                result = originMethod.apply(ins, joinPoint.args);
              }
              const resultTemp = aspectIns.afterReturn?.(joinPoint, result);
              result = typeof resultTemp === 'undefined' ? result : resultTemp;
              if (result && isClass(result.constructor)) {
                return this.wrapperAspectToInstance(ins);
              } else {
                return result;
              }
            } catch (err) {
              error = err;
              if (aspectIns.afterThrow) {
                aspectIns.afterThrow(joinPoint, error);
              } else {
                throw err;
              }
            } finally {
              aspectIns.after?.(joinPoint, result, error);
            }
          };
        };

        methodAspectCollection.push(fn);
      }
    }
  }

  /**
   * wrapper aspect method before instance return
   * @param ins
   * @protected
   */
  public wrapperAspectToInstance(ins) {
    let proxy = null;
    /**
     * 过滤循环依赖创建的对象
     */
    if (!ins['__is_proxy__'] && ins?.constructor) {
      // 动态处理拦截器
      let methodAspectCollection;
      // if (this.aspectMappingMap?.has(ins.constructor)) {
      //   methodAspectCollection = this.aspectMappingMap.get(ins.constructor);
      // } else if (
      //   (this.container?.parent as IMidwayContainer)
      //     ?.getAspectService()
      //     .hasAspect(ins.constructor)
      // ) {
      //   // for requestContainer
      //   methodAspectCollection = (this.container?.parent as IMidwayContainer)
      //     ?.getAspectService()
      //     .hasAspect(ins.constructor);
      // }

      if (methodAspectCollection) {
        proxy = new Proxy(ins, {
          get: (obj, prop) => {
            if (typeof prop === 'string' && methodAspectCollection.has(prop)) {
              const aspectFn = methodAspectCollection.get(prop);
              return aspectFn[0](ins, obj[prop]);
            }
            return obj[prop];
          },
        });
      }
    }
    return proxy || ins;
  }

  hasAspect(module): boolean {
    return this.aspectMappingMap.has(module);
  }
}
