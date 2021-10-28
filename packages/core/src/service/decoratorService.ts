import {
  getClassMetadata,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  INJECT_CUSTOM_METHOD,
  APPLICATION_CONTEXT_KEY,
} from '@midwayjs/decorator';
import { HandlerFunction, IMidwayContainer } from '../interface';
import { MidwayAspectService } from './aspectService';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayDecoratorService {
  private propertyHandlerMap = new Map<string, HandlerFunction>();
  /**
   * @example
   * {
   *  decoratorKey: [
   *    {
   *      clz,
   *      method,
   *    },
   *    {
   *      clz,
   *      method,
   *    }
   *   ]
   * }
   * @private
   */
  private aspectMethodDecoratorMap: Map<string, (...args) => any> = new Map();

  @Inject()
  private aspectService: MidwayAspectService;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    // add custom method decorator listener
    this.applicationContext.onAfterBind((Clzz, options) => {
      // find custom method decorator metadata, include method decorator information array
      const metadataList: Array<{
        propertyName: string;
        key: string;
        metadata: any;
      }> = getClassMetadata(INJECT_CUSTOM_METHOD, Clzz);

      if (metadataList) {
        // loop it, save this order for decorator run
        for (const meta of metadataList) {
          const { propertyName, key, metadata } = meta;

          // add aspect implementation first
          this.aspectService.interceptPrototypeMethod(
            Clzz,
            propertyName,
            () => {
              return this.aspectMethodDecoratorMap.get(key)(
                Clzz,
                propertyName,
                metadata
              );
            }
          );
        }
      }
    });

    // add custom property decorator listener
    this.applicationContext.onObjectCreated((instance, options) => {
      if (
        this.propertyHandlerMap.size > 0 &&
        Array.isArray(options.definition.handlerProps)
      ) {
        // 已经预先在 bind 时处理
        for (const item of options.definition.handlerProps) {
          this.defineGetterPropertyValue(
            item,
            instance,
            this.getHandler(item.key)
          );
        }
      }
    });

    // register @ApplicationContext
    this.registerPropertyHandler(
      APPLICATION_CONTEXT_KEY,
      (propertyName, mete) => {
        return this.applicationContext;
      }
    );
  }

  public registerPropertyHandler(decoratorKey: string, fn: HandlerFunction) {
    this.propertyHandlerMap.set(decoratorKey, fn);
  }

  public registerMethodHandler(decoratorKey: string, fn: any) {
    this.aspectMethodDecoratorMap.set(decoratorKey, fn);
  }

  /**
   * binding getter method for decorator
   *
   * @param prop
   * @param instance
   * @param getterHandler
   */
  private defineGetterPropertyValue(prop, instance, getterHandler) {
    if (prop && getterHandler) {
      if (prop.propertyName) {
        Object.defineProperty(instance, prop.propertyName, {
          get: () =>
            getterHandler(prop.propertyName, prop.metadata ?? {}, instance),
          configurable: true, // 继承对象有可能会有相同属性，这里需要配置成 true
          enumerable: true,
        });
      }
    }
  }

  private getHandler(key: string) {
    if (this.propertyHandlerMap.has(key)) {
      return this.propertyHandlerMap.get(key);
    }
  }
}
