import type { IObjectCreator, IObjectDefinition } from '../interface';
import { MidwayUseWrongMethodError } from '../error';
import { Types } from '../util/types';

export class ObjectCreator implements IObjectCreator {
  protected definition: IObjectDefinition;

  constructor(definition: IObjectDefinition) {
    this.definition = definition;
  }

  /**
   * 加载对象class
   * @returns {class} Clzz对象的Class
   */
  load(): any {
    let Clzz = null;
    if (typeof this.definition.path === 'string') {
      // 解析xml结果 默认 path = '' 需要兼容处理掉
      if (!this.definition.path) {
        return Clzz;
      }
      const path = this.definition.path;
      if (this.definition.export) {
        Clzz = require(path)[this.definition.export];
      } else {
        Clzz = require(path);
      }
    } else {
      // if it is class and return direct
      Clzz = this.definition.path;
    }
    return Clzz;
  }

  /**
   * 构建对象实例
   * @param Clzz 对象class，通过load加载
   * @param args 对象初始化参数
   * @returns {any} 返回创建的对象实例
   */
  doConstruct(Clzz: any, args?: any): any {
    if (!Clzz) {
      return Object.create(null);
    }

    let inst;
    if (this.definition.constructMethod) {
      // eslint-disable-next-line prefer-spread
      inst = Clzz[this.definition.constructMethod].apply(Clzz, args);
    } else {
      inst = Reflect.construct(Clzz, args);
    }
    return inst;
  }

  /**
   * 异步构造对象
   * @param Clzz 对象class，通过load加载
   * @param args 对象初始化参数
   * @returns {any} 返回创建的对象实例
   */
  async doConstructAsync(Clzz: any, args?: any): Promise<any> {
    if (!Clzz) {
      return Object.create(null);
    }

    let inst;
    if (this.definition.constructMethod) {
      const fn = Clzz[this.definition.constructMethod];
      if (Types.isAsyncFunction(fn)) {
        inst = await fn.apply(Clzz, args);
      } else {
        inst = fn.apply(Clzz, args);
      }
    } else {
      inst = Reflect.construct(Clzz, args);
    }
    return inst;
  }

  /**
   * 调用对象初始化方法进行初始化
   * @param obj 对象，由doConstruct返回
   * @returns {void}
   */
  doInit(obj: any): void {
    const inst = obj;
    // after properties set then do init
    if (this.definition.initMethod && inst[this.definition.initMethod]) {
      if (
        Types.isGeneratorFunction(inst[this.definition.initMethod]) ||
        Types.isAsyncFunction(inst[this.definition.initMethod])
      ) {
        throw new MidwayUseWrongMethodError(
          'context.get',
          'context.getAsync',
          this.definition.id
        );
      } else {
        const rt = inst[this.definition.initMethod].call(inst);
        if (Types.isPromise(rt)) {
          throw new MidwayUseWrongMethodError(
            'context.get',
            'context.getAsync',
            this.definition.id
          );
        }
      }
    }
  }

  /**
   * 调用对象初始化方法进行初始化
   * @param obj 对象，由doConstructAsync返回
   * @returns {void}
   */
  async doInitAsync(obj: any): Promise<void> {
    const inst = obj;
    if (this.definition.initMethod && inst[this.definition.initMethod]) {
      const initFn = inst[this.definition.initMethod];
      if (Types.isAsyncFunction(initFn)) {
        await initFn.call(inst);
      } else {
        if (initFn.length === 1) {
          await new Promise(resolve => {
            initFn.call(inst, resolve);
          });
        } else {
          initFn.call(inst);
        }
      }
    }
  }

  /**
   * 对象销毁
   * @param obj 对象，由doConstruct返回
   * @returns {void}
   */
  doDestroy(obj: any): void {
    if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
      obj[this.definition.destroyMethod].call(obj);
    }
  }

  /**
   * 对象销毁
   * @param obj 对象，由doConstructAsync返回
   * @returns {void}
   */
  async doDestroyAsync(obj: any): Promise<void> {
    if (this.definition.destroyMethod && obj[this.definition.destroyMethod]) {
      const fn = obj[this.definition.destroyMethod];
      if (Types.isAsyncFunction(fn)) {
        await fn.call(obj);
      } else {
        if (fn.length === 1) {
          await new Promise(resolve => {
            fn.call(obj, resolve);
          });
        } else {
          fn.call(obj);
        }
      }
    }
  }
}
