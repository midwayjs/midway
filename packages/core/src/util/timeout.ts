import { MidwayCodeInvokeTimeoutError } from '../error';

/**
 * Create a Promise that resolves after the specified time
 * @param options
 */
export async function createPromiseTimeoutInvokeChain<Result>(options: {
  /**
   * The promise items to be executed
   */
  promiseItems: Array<{
    /**
     * The promise item function, it will be executed in the timeout chain, and accept the abortController from the function call
     */
    item: (...args: any[]) => Promise<any>;
    /**
     * The promise item name, it will be used in error message
     */
    itemName?: string;
    /**
     * The promise item meta, which will be passed to the onSuccess and onFail callback
     */
    meta?: any;
    /**
     * The promise item timeout time
     */
    timeout?: number;
  }>;
  /**
   * The default promise item timeout time, it used to set the timeout time in promiseItems if not provided
   */
  itemTimeout?: number;
  /**
   * The total execution timeout time
   */
  timeout?: number;
  /**
   * The method name, just for error message
   */
  methodName: string;
  /**
   * The success callback, if not provided, will ignore the result
   */
  onSuccess?: (result: any, meta: any) => Result | Promise<Result>;
  /**
   * The fail callback, if not provided, will throw error
   */
  onFail?: (err: Error, meta: any) => Result | Promise<Result>;
  /**
   * Whether to execute concurrently, default is true, if false, will execute sequentially by for loop
   */
  isConcurrent?: boolean;
  /**
   * The abort controller, if provided, will abort the timeout waiting and stop the execution
   */
  abortController?: AbortController;
}): Promise<Result[]> {
  if (!options.onSuccess) {
    options.onSuccess = async result => {
      return result as Result;
    };
  }
  options.isConcurrent = options.isConcurrent ?? true;
  // abort controller
  const abortController = options.abortController ?? new AbortController();

  // total timeout
  let totalExecutionTimeoutHandler: NodeJS.Timeout | undefined;
  const itemTimeoutHandlers = [];
  let totalTimeoutPromise: Promise<void> | undefined;

  if (options.timeout) {
    totalTimeoutPromise = new Promise((_, reject) => {
      totalExecutionTimeoutHandler = setTimeout(() => {
        reject(
          new MidwayCodeInvokeTimeoutError(options.methodName, options.timeout)
        );
      }, options.timeout);
    });
  }

  abortController.signal.addEventListener('abort', () => {
    itemTimeoutHandlers.forEach(handler => {
      clearTimeout(handler);
    });
    if (totalExecutionTimeoutHandler) {
      clearTimeout(totalExecutionTimeoutHandler);
    }
  });

  const realPromiseItems = options.promiseItems.filter(item => {
    return typeof item['item'] === 'function';
  });

  if (options.isConcurrent) {
    // For each check item, we create a timeout Promise
    const checkPromises = realPromiseItems.map(item => {
      const itemTimeout = item['timeout'] ?? options.itemTimeout;
      const timeoutPromise = itemTimeout
        ? new Promise((_, reject) => {
            // The timeout Promise fails after the specified time
            itemTimeoutHandlers.push(
              setTimeout(
                () =>
                  reject(
                    new MidwayCodeInvokeTimeoutError(
                      options.methodName,
                      itemTimeout,
                      item['itemName']
                    )
                  ),
                itemTimeout
              )
            );
          })
        : null;
      // We use Promise.race to wait for either the check item or the timeout Promise
      return (
        Promise.race([
          Promise.resolve(item['item'](abortController)),
          timeoutPromise,
        ])
          // If the check item Promise resolves, we set the result to success
          .then(re => {
            return options.onSuccess(re, item['meta']);
          })
          // If the timeout Promise resolves (i.e., the check item Promise did not resolve in time), we set the result to failure
          .catch(err => {
            if (options.onFail) {
              return options.onFail?.(err, item['meta']);
            } else {
              throw err;
            }
          })
      );
    });
    if (totalTimeoutPromise) {
      return Promise.race([Promise.all(checkPromises), totalTimeoutPromise])
        .finally(() => {
          abortController.abort();
        })
        .then(results => {
          return results as Result[];
        })
        .finally(() => {
          abortController.abort();
        });
    } else {
      return Promise.all(checkPromises)
        .finally(() => {
          abortController.abort();
        })
        .then(results => {
          return results as Result[];
        });
    }
  } else {
    // 串行执行
    const results = [];
    // 包装整个串行执行过程
    const serialExecution = async () => {
      for (const item of realPromiseItems) {
        const itemTimeout = item['timeout'] ?? options.itemTimeout;
        const timeoutPromise = itemTimeout
          ? new Promise((_, reject) => {
              itemTimeoutHandlers.push(
                setTimeout(
                  () =>
                    reject(
                      new MidwayCodeInvokeTimeoutError(
                        options.methodName,
                        itemTimeout,
                        item['itemName']
                      )
                    ),
                  itemTimeout
                )
              );
            })
          : null;

        try {
          const result = await Promise.race(
            [
              Promise.resolve(item['item'](abortController)),
              timeoutPromise,
            ].filter(Boolean)
          );

          results.push(await options.onSuccess(result, item['meta']));
        } catch (error) {
          if (options.onFail) {
            results.push(await options.onFail(error, item['meta']));
            break;
          } else {
            throw error;
          }
        }
      }
      return results;
    };

    // 将整个串行执行过程与总超时竞争
    if (totalTimeoutPromise) {
      return Promise.race([serialExecution(), totalTimeoutPromise])
        .then(results => {
          return results as Result[];
        })
        .finally(() => {
          abortController.abort();
        });
    } else {
      return serialExecution()
        .then(results => {
          return results as Result[];
        })
        .finally(() => {
          abortController.abort();
        });
    }
  }
}
