import {
  getClassMetadata,
  Init,
  Inject,
  Provide,
  Scope,
  INJECT_CUSTOM_METHOD,
  APPLICATION_CONTEXT_KEY,
  INJECT_CUSTOM_PARAM,
  JoinPoint,
  getMethodParamTypes,
  ScopeEnum,
} from '../decorator';
import {
  HandlerFunction,
  IMidwayContainer,
  MethodHandlerFunction,
  ParameterHandlerFunction,
} from '../interface';
import { MidwayAspectService } from './aspectService';
import { MidwayCommonError } from '../error';
import * as util from 'util';

const debug = util.debuglog('midway:debug');

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayDecoratorService {
  private propertyHandlerMap = new Map<string, HandlerFunction>();
  private methodDecoratorMap: Map<string, (...args) => any> = new Map();
  private parameterDecoratorMap: Map<string, (...args) => any> = new Map();

  @Inject()
  private aspectService: MidwayAspectService;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected init() {
    // add custom method decorator listener
    this.applicationContext.onBeforeBind(Clzz => {
      // find custom method decorator metadata, include method decorator information array
      const methodDecoratorMetadataList: Array<{
        propertyName: string;
        key: string;
        metadata: any;
        impl: boolean;
      }> = getClassMetadata(INJECT_CUSTOM_METHOD, Clzz);

      if (methodDecoratorMetadataList) {
        // loop it, save this order for decorator run
        for (const meta of methodDecoratorMetadataList) {
          const { propertyName, key, metadata, impl } = meta;
          if (!impl) {
            continue;
          }
          // add aspect implementation first
          this.aspectService.interceptPrototypeMethod(
            Clzz,
            propertyName,
            () => {
              const methodDecoratorHandler = this.methodDecoratorMap.get(key);
              if (!methodDecoratorHandler) {
                throw new MidwayCommonError(
                  `Method Decorator "${key}" handler not found, please register first.`
                );
              }
              return methodDecoratorHandler({
                target: Clzz,
                propertyName,
                metadata,
              });
            }
          );
        }
      }

      // find custom param decorator metadata
      const parameterDecoratorMetadata: {
        [methodName: string]: Array<{
          key: string;
          parameterIndex: number;
          propertyName: string;
          metadata: any;
          impl: boolean;
        }>;
      } = getClassMetadata(INJECT_CUSTOM_PARAM, Clzz);

      if (parameterDecoratorMetadata) {
        // loop it, save this order for decorator run
        for (const methodName of Object.keys(parameterDecoratorMetadata)) {
          // add aspect implementation first
          this.aspectService.interceptPrototypeMethod(Clzz, methodName, () => {
            return {
              before: async (joinPoint: JoinPoint) => {
                // joinPoint.args
                const newArgs = [...joinPoint.args];
                for (const meta of parameterDecoratorMetadata[methodName]) {
                  const { propertyName, key, metadata, parameterIndex, impl } =
                    meta;
                  if (!impl) {
                    continue;
                  }

                  const parameterDecoratorHandler =
                    this.parameterDecoratorMap.get(key);
                  if (!parameterDecoratorHandler) {
                    throw new MidwayCommonError(
                      `Parameter Decorator "${key}" handler not found, please register first.`
                    );
                  }
                  const paramTypes = getMethodParamTypes(Clzz, propertyName);
                  try {
                    newArgs[parameterIndex] = await parameterDecoratorHandler({
                      metadata,
                      propertyName,
                      parameterIndex,
                      target: Clzz,
                      originArgs: joinPoint.args,
                      originParamType: paramTypes[parameterIndex],
                    });
                  } catch (err) {
                    // ignore
                    debug(
                      `[core]: Parameter decorator throw error and use origin args, ${err.stack}`
                    );
                  }
                }
                joinPoint.args = newArgs;
              },
            };
          });
        }
      }
    });

    // add custom property decorator listener
    this.applicationContext.onObjectCreated((instance, options) => {
      if (
        this.propertyHandlerMap.size > 0 &&
        Array.isArray(options.definition.handlerProps)
      ) {
        // has bind in container
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
    debug(`[core]: Register property decorator key="${decoratorKey}"`);
    this.propertyHandlerMap.set(decoratorKey, fn);
  }

  public registerMethodHandler(
    decoratorKey: string,
    fn: MethodHandlerFunction
  ) {
    debug(`[core]: Register method decorator key="${decoratorKey}"`);
    this.methodDecoratorMap.set(decoratorKey, fn);
  }

  public registerParameterHandler(
    decoratorKey: string,
    fn: ParameterHandlerFunction
  ) {
    debug(`[core]: Register parameter decorator key="${decoratorKey}"`);
    this.parameterDecoratorMap.set(decoratorKey, fn);
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
