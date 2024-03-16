import { ApplicationContext, Inject, Provide, Scope } from '../decorator';
import {
  HealthResult,
  HealthResults,
  IMidwayContainer,
  ScopeEnum,
} from '../interface';
import { MidwayConfigService } from './configService';
import { createPromiseTimeoutInvokeChain } from '../util';

interface InnerHealthResult extends HealthResult {
  namespace: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayHealthService {
  @Inject()
  protected configService: MidwayConfigService;

  @ApplicationContext()
  protected applicationContext: IMidwayContainer;

  private healthCheckTimeout = 1000;
  private healthCheckMethods: Array<{
    item: (container: IMidwayContainer) => Promise<HealthResult>;
    meta: {
      namespace: string;
    };
  }> = [];

  async init(
    lifeCycleInstanceList: Array<{
      target: any;
      namespace: string;
      instance?: any;
    }>
  ) {
    const healthCheckTimeout =
      this.configService.getConfiguration('core.healthCheckTimeout') || 1000;
    this.setCheckTimeout(healthCheckTimeout);

    for (const lifecycleInstance of lifeCycleInstanceList) {
      if (
        lifecycleInstance.instance &&
        lifecycleInstance.instance['onHealthCheck']
      ) {
        this.healthCheckMethods.push({
          item: lifecycleInstance.instance['onHealthCheck'].bind(
            lifecycleInstance.instance
          ),
          meta: {
            namespace: lifecycleInstance.namespace,
          },
        });
      }
    }
  }

  async getStatus(): Promise<HealthResults> {
    const checkResult: InnerHealthResult[] =
      await createPromiseTimeoutInvokeChain<InnerHealthResult>({
        promiseItems: this.healthCheckMethods.map(item => {
          return {
            item: item.item(this.applicationContext),
            meta: item.meta,
          };
        }),
        timeout: this.healthCheckTimeout,
        methodName: 'configuration.onHealthCheck',
        onSuccess: (result, meta) => {
          if (result['status'] !== undefined) {
            return {
              namespace: meta.namespace,
              ...result,
            };
          } else {
            return {
              status: false,
              namespace: meta.namespace,
              reason:
                'configuration.onHealthCheck return value must be object and contain status field',
            };
          }
        },
        onFail: (err, meta) => {
          return {
            status: false,
            namespace: meta.namespace,
            reason: err.message,
          };
        },
      });

    const failedResult = checkResult.find(item => !item.status);

    return {
      status: !failedResult,
      namespace: failedResult?.namespace,
      reason: failedResult?.reason,
      results: checkResult,
    };
  }

  setCheckTimeout(timeout: number): void {
    this.healthCheckTimeout = timeout;
  }
}
