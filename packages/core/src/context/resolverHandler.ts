import { CLASS_KEY_CONSTRUCTOR, getClassMetadata } from '@midwayjs/decorator';
import { ManagedResolverFactory } from './managedResolverFactory';
import * as util from 'util';
import {
  HandlerFunction,
  IResolverHandler,
  FrameworkDecoratorMetadata,
  IObjectDefinition,
  IMidwayContainer,
} from '../interface';

const debug = util.debuglog('midway:container');

export class ResolverHandler implements IResolverHandler {
  private handlerMap: Map<string, HandlerFunction>;
  private resolverFactory: ManagedResolverFactory;

  constructor(container: IMidwayContainer, factory: ManagedResolverFactory) {
    this.resolverFactory = factory;
    this.handlerMap = new Map<string, HandlerFunction>();
    this.bindCreatedHook();
  }

  bindCreatedHook() {
    this.resolverFactory.beforeEachCreated(this.beforeEachCreated.bind(this));
    this.resolverFactory.afterEachCreated(this.afterEachCreated.bind(this));
  }
  /**
   * 创建对象前
   * @param target 当前对象
   * @param constructorArgs 构造参数
   * @param context 上下文
   */
  beforeEachCreated(target, constructorArgs: any[], context) {
    let constructorMetaData;
    try {
      constructorMetaData = getClassMetadata(CLASS_KEY_CONSTRUCTOR, target);
    } catch (e) {
      debug(`beforeEachCreated error ${e.stack}`);
    }
    // lack of field
    if (constructorMetaData && constructorArgs) {
      for (const idx in constructorMetaData) {
        const index = parseInt(idx, 10);
        const propertyMeta = constructorMetaData[index];
        const hook = this.getHandler(propertyMeta.type);
        if (hook) {
          constructorArgs[index] = hook(propertyMeta.key);
        }
      }
    }
  }
  /**
   * 创建对象后
   * @param instance 对象
   * @param context 上下文
   * @param definition 定义
   */
  afterEachCreated(instance, context, definition: IObjectDefinition) {
    if (this.handlerMap.size > 0 && Array.isArray(definition.handlerProps)) {
      // 已经预先在 bind 时处理
      for (const item of definition.handlerProps) {
        this.defineGetterPropertyValue(
          item.prop,
          instance,
          this.getHandler(item.handlerKey)
        );
      }
    }
  }
  /**
   * binding getter method for decorator
   *
   * @param setterProps
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(
    prop: FrameworkDecoratorMetadata,
    instance,
    getterHandler
  ) {
    if (prop && getterHandler) {
      if (prop.propertyName) {
        Object.defineProperty(instance, prop.propertyName, {
          get: () => getterHandler(prop.targetKey, prop.meta, instance),
          configurable: true, // 继承对象有可能会有相同属性，这里需要配置成 true
          enumerable: true,
        });
      }
    }
  }

  registerHandler(key: string, fn: HandlerFunction) {
    this.handlerMap.set(key, fn);
  }

  hasHandler(key: string) {
    return this.handlerMap.has(key);
  }

  getHandler(key: string) {
    if (this.handlerMap.has(key)) {
      return this.handlerMap.get(key);
    }
  }
}
