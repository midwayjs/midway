import {
  getClassMetadata,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
  INJECT_CUSTOM_METHOD,
} from '@midwayjs/decorator';
import { IMidwayContainer } from '../interface';
import { MidwayAspectService } from './aspectService';

interface MethodDecoratorMapping {
  clz: new (...args) => any;
  methodName: string;
  metadata: any;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayDecoratorService {
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
  private aspectMethodDecoratorMap: Map<string, Array<MethodDecoratorMapping>> =
    new Map();

  @Inject()
  private aspectService: MidwayAspectService;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    this.applicationContext.onAfterBind((Clzz, options) => {
      // inject custom method decorator
      const metadataList: Array<{
        propertyName: string;
        key: string;
        metadata: any;
      }> = getClassMetadata(INJECT_CUSTOM_METHOD, Clzz);

      if (metadataList) {
        for (const meta of metadataList) {
          const { propertyName, key, metadata } = meta;
          if (!this.aspectMethodDecoratorMap.has(key)) {
            this.aspectMethodDecoratorMap.set(key, []);
          }
          const mappings = this.aspectMethodDecoratorMap.get(key);
          mappings.push({
            clz: Clzz,
            methodName: propertyName,
            metadata,
          });
        }
      }
    });
  }

  public registerMethodDecorator(decoratorKey: string, fn: any) {
    // 判断是否存在这个 key，存在的话，直接修改原型链
    if (this.aspectMethodDecoratorMap.has(decoratorKey)) {
      const mappings = this.aspectMethodDecoratorMap.get(decoratorKey);
      for (const mapping of mappings) {
        this.aspectService.interceptPrototypeMethod(
          mapping.clz,
          mapping.methodName,
          fn(mapping.clz, mapping.methodName, mapping.metadata)
        );
      }
    }
  }
}
