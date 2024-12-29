import {
  IMidwayApplication,
  IMidwayContainer,
  MidwayCodeInvokeTimeoutError,
  MidwayContainer,
  MidwayLifeCycleService,
  sleep
} from '../../src';
import { defineConfiguration } from '../../src/functional';

type LifecycleInstanceItem = {
  target: any;
  namespace: string;
  instance?: any;
};

describe('test MidwayLifeCycleService', () => {

  class CustomMidwayLifeCycleService extends MidwayLifeCycleService {
    public async runCustomLifeCycle(
      lifecycleInstanceOrList: LifecycleInstanceItem[],
      lifecycle: string,
      runOptions?: {
        resultHandler?: (result: any) => void;
        timeout?: number;
      }) {
      await this.runContainerLifeCycle(lifecycleInstanceOrList, lifecycle, runOptions);
    }
  }

  it('should test create lifeCycle and run it', async () => {
    const container = new MidwayContainer();
    const lifecycleService = new CustomMidwayLifeCycleService(container);
    lifecycleService['frameworkService'] = {
      getMainApp() {
        return {} as any;
      }
    } as any;

    let total = 1;

    await lifecycleService.runCustomLifeCycle([
      {
        target: undefined,
        namespace: 'test',
        instance: defineConfiguration({
          namespace: 'test',
          async onReady(container: IMidwayContainer, mainApp?: IMidwayApplication) {
            total++;
          }
        }),
      },
      {
        target: undefined,
        namespace: 'test',
        instance: defineConfiguration({
          namespace: 'test',
          async onReady(container: IMidwayContainer, mainApp?: IMidwayApplication) {
            total++;
          }
        }),
      },
    ], 'onReady');

    expect(total).toEqual(3);
  });

  it('should test run lifeCycle timeout', async () => {
    const container = new MidwayContainer();
    const lifecycleService = new CustomMidwayLifeCycleService(container);
    lifecycleService['frameworkService'] = {
      getMainApp() {
        return {} as any;
      }
    } as any;

    const promise = lifecycleService.runCustomLifeCycle([
      {
        target: undefined,
        namespace: 'test',
        instance: defineConfiguration({
          namespace: 'test',
          async onReady(container: IMidwayContainer, mainApp?: IMidwayApplication, options?: { abortController: AbortController }) {
            await sleep(5000, options.abortController);
          }
        }),
      },
    ], 'onReady', {
      timeout: 1000
    });

    await expect(promise).rejects.toThrow(MidwayCodeInvokeTimeoutError);
  });
});
