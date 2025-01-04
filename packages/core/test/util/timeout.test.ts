import { createPromiseTimeoutInvokeChain } from '../../src/util/timeout';
import { MidwayCodeInvokeTimeoutError, sleep } from '../../src';

describe('test create timeout handler', () => {
  it('should test create timeout handler and throw error in user code', async () => {
    const result = await createPromiseTimeoutInvokeChain<number>({
      promiseItems: [
        {
          item: async (ac) => {
            await sleep(10, ac);
            throw new Error('error');
          }
        },
        {
          item: () => {
            return 2 as any;
          }
        },
        {
          item: async (ac) => {
            await sleep(10, ac);
            return 1;
          }
        },
      ],
      onFail(err) {
        return 1;
      },
      methodName: 'configuration.onReady',
      itemTimeout: 100,
    });

    expect(result).toEqual([1, 2, 1]);
  });

  it('should test create timeout handler and return in 100ms', async () => {
    const result = await createPromiseTimeoutInvokeChain<number>({
      promiseItems: [
        {
          item: async (ac) => {
            await sleep(10, ac);
            return 0;
          },
        },
        {
          item: async (ac) => {
            await sleep(30, ac);
            return 0;
          },
        },
      ],
      onFail(err) {
        return 1;
      },
      methodName: 'configuration.onReady',
      itemTimeout: 100,
    });

    expect(result).toEqual([0, 0]);
  });

  it('should test create timeout handler and got result timeout', async () => {
    const result = await createPromiseTimeoutInvokeChain<number>({
      promiseItems: [
        {
          item: async (ac) => {
            await sleep(200, ac);
            return 0;
          },
        },
        {
          item: async (ac) => {
            await sleep(30, ac);
            return 0;
          },
        },
      ],
      onFail(err) {
        return 1;
      },
      methodName: 'configuration.onReady',
      itemTimeout: 100,
    });

    expect(result).toEqual([1, 0]);
  });

  it('should test promise sequential call and break on biz error', async () => {
    const result = await createPromiseTimeoutInvokeChain<number>({
      promiseItems: [
        {
          item: async (ac) => {
            await sleep(10, ac);
            throw new Error('error');
          }
        },
        {
          item: () => {
            return 2 as any;
          }
        },
        {
          item: async (ac) => {
            await sleep(10, ac);
            return 1;
          }
        },
      ],
      onFail(err) {
        return 3;
      },
      methodName: 'configuration.onReady',
      itemTimeout: 100,
      isConcurrent: false,
    });

    expect(result).toEqual([3]);
  });

  it('should test promise sequential call with meta and custom timeout', async () => {
    const result = await createPromiseTimeoutInvokeChain<number>({
      promiseItems: [
        {
          item: async (ac) => {
            await sleep(10, ac);
            return 3;
          },
          meta: {
            name: 'p1',
          },
          timeout: 100,
        },
        {
          item: async (ac) => {
            return 2;
          },
          meta: {
            name: 'p2',
          },
        },
        {
          item: async (ac) => {
            await sleep(10, ac);
            return 1;
          },
          meta: {
            name: 'p3',
          },
        },
      ],
      onFail(err) {
        return 4;
      },
      methodName: 'configuration.onReady',
      itemTimeout: 100,
      isConcurrent: false,
    });

    expect(result).toEqual([3, 2, 1]);
  });

  it('should test promise sequential run code timeout', async () => {
    const p1 = async () => {
      await sleep(100);
      return 1;
    };

    const p2 = async () => {
      return 2 as any;
    };

    const p3 = async () => {
      await sleep(10);
      return 3;
    };

    const result = await createPromiseTimeoutInvokeChain<{
      value: number;
      name: string;
    }>({
      promiseItems: [
        {
          item: p1,
          meta: {
            name: 'p1',
          },
        },
        {
          item: p2,
          meta: {
            name: 'p2',
          },
        },
        {
          item: p3,
          meta: {
            name: 'p3',
          },
        },
      ],
      onFail(err, meta) {
        return {value: 4, name: meta.name, reason: err.message};
      },
      methodName: 'configuration.onReady',
      itemTimeout: 50,
      isConcurrent: false,
    });

    expect(result).toEqual([
      {
        'name': 'p1',
        "reason": "Function \"configuration.onReady\" call more than 50ms",
        'value': 4
      }
    ]);
  });

  it('should test promise sequential run code with custom timeout', async () => {
    const p1 = async () => {
      await sleep(100);
      return 3;
    };

    const p2 = () => {
      return 2 as any;
    };

    const p3 = async () => {
      await sleep(10);
      return 1;
    };

    const result = await createPromiseTimeoutInvokeChain<{
      value: number;
      name: string;
    }>({
      promiseItems: [
        {
          item: p1,
          meta: {
            name: 'p1',
          },
          timeout: 80
        },
        {
          item: p2,
          meta: {
            name: 'p2',
          },
        },
        {
          item: p3,
          meta: {
            name: 'p3',
          },
        },
      ],
      onFail(err, meta) {
        return {value: 4, name: meta.name, reason: err.message};
      },
      methodName: 'configuration.onReady',
      itemTimeout: 50,
      isConcurrent: false,
    });

    expect(result).toEqual([{
      'name': 'p1',
      "reason": "Function \"configuration.onReady\" call more than 80ms",
      'value': 4
    }]);
  });

  it('should test throw error when not provide onFail', async () => {
    await expect(createPromiseTimeoutInvokeChain({
      promiseItems: [{
        item: async (ac) => {
          await sleep(100, ac);
          return 3;
        },
      }],
      methodName: 'configuration.onReady',
      itemTimeout: 50,
    })).rejects.toThrow(MidwayCodeInvokeTimeoutError);
  });

  it('should test throw erro when not provide onFail in not concurrent mode', async () => {

    await expect(createPromiseTimeoutInvokeChain({
      promiseItems: [{
        item: async (ac) => {
          await sleep(100, ac);
          return 3;
        },
      }],
      methodName: 'configuration.onReady',
      itemTimeout: 50,
      isConcurrent: false,
    })).rejects.toThrow(MidwayCodeInvokeTimeoutError);
  });

  it('should test throw error when set total timeout', async () => {
    const promise = createPromiseTimeoutInvokeChain({
      promiseItems: [{
        item: async (ac) => {
          await sleep(100, ac);
          return 3;
        },
      }],
      methodName: 'configuration.onReady',
      itemTimeout: 150,
      timeout: 50,
    });

    await expect(promise).rejects.toThrow(MidwayCodeInvokeTimeoutError);
  });

  it('should test throw error when set abort controller', async () => {
    await new Promise<void>((resolve, reject) => {
      let total = 0;
      const abortController = new AbortController();

      createPromiseTimeoutInvokeChain({
        promiseItems: [{
          item: async (ac) => {
            await sleep(10000, ac);
            total++;
            reject();
          },
        }],
        methodName: 'configuration.onReady',
        abortController,
      });

      setTimeout(() => {
        abortController.abort();
        expect(total).toEqual(0);
        resolve();
      }, 100);
    })
  });

  it('should add item name and throw with it', async () => {
    const promise = createPromiseTimeoutInvokeChain({
      promiseItems: [{
        item: async (ac) => {
          await sleep(200, ac);
          return 3;
        },
        itemName: 'p1',
      }],
      methodName: 'configuration.onReady',
      itemTimeout: 100,
    });

    await expect(promise).rejects.toThrow('Function \"configuration.onReady\" of \"p1\" call more than 100ms');
  });
})
