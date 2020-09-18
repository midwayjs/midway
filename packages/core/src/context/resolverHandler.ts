import {
  CLASS_KEY_CONSTRUCTOR,
  getClassMetadata,
  CONFIG_KEY,
} from '@midwayjs/decorator';
import { ManagedResolverFactory } from './managedResolverFactory';
import { MidwayContainer } from './midwayContainer';
import { MIDWAY_ALL_CONFIG } from '../common/constants';

interface FrameworkDecoratorMetadata {
  key: string;
  propertyName: string;
}

const debug = require('debug')('midway:container');

export type HandlerFunction = (handlerKey: string, instance?: any) => any;

export class ResolverHandler {
  private handlerMap: Map<string, HandlerFunction>;
  private resolverFactory: ManagedResolverFactory;
  private container: MidwayContainer;

  constructor(container: MidwayContainer, factory: ManagedResolverFactory) {
    this.container = container;
    this.resolverFactory = factory;
    this.handlerMap = new Map<string, HandlerFunction>();
    this.bindCreatedHook();
  }

  bindCreatedHook() {
    this.resolverFactory.beforeEachCreated(this.beforeEachCreated.bind(this));
    this.resolverFactory.afterEachCreated(this.afterEachCreated.bind(this));

    if (this.container.configService) {
      // register handler for container
      this.registerHandler(CONFIG_KEY, (key: string) => {
        if (key) {
          if (key === MIDWAY_ALL_CONFIG) {
            return this.container.configService.getConfiguration();
          } else {
            const val = this.container.configService.getConfiguration(key);
            debug('@config key => %s value => %j.', key, val);
            return val;
          }
        }
      });
    }
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
  afterEachCreated(instance, context, definition) {
    const iter = this.handlerMap.keys();
    for (const key of iter) {
      // 处理配置装饰器
      const setterProps: FrameworkDecoratorMetadata[] = getClassMetadata(
        key,
        instance
      );
      this.defineGetterPropertyValue(
        setterProps,
        instance,
        this.getHandler(key)
      );
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
    setterProps: FrameworkDecoratorMetadata[],
    instance,
    getterHandler
  ) {
    if (setterProps && getterHandler) {
      for (const prop of setterProps) {
        if (prop.propertyName) {
          Object.defineProperty(instance, prop.propertyName, {
            get: () => getterHandler(prop.key, instance),
            configurable: true, // 继承对象有可能会有相同属性，这里需要配置成 true
            enumerable: true,
          });
        }
      }
    }
  }

  registerHandler(key: string, fn: HandlerFunction) {
    this.handlerMap.set(key, fn);
  }

  getHandler(key: string) {
    if (this.handlerMap.has(key)) {
      return this.handlerMap.get(key);
    }
  }
}
