import { sleep } from '.';
import { MidwayRetryExceededMaxTimesError } from '../error';

/**
 * wrap async function with retry
 * @param retryFn
 * @param retryTimes
 * @param options
 */
export function retryWithAsync<T extends (...args) => Promise<unknown>>(
  retryFn: T,
  retryTimes = 1,
  options: {
    throwOriginError?: boolean;
    retryInterval?: number;
    receiver?: any;
  } = {}
): (...args: Parameters<T>) => ReturnType<T> {
  let defaultRetry = retryTimes;
  let error;

  return (async (...args: Parameters<T>) => {
    do {
      try {
        return await retryFn.bind(options.receiver || this)(...args);
      } catch (err) {
        error = err;
      }
      if (options.retryInterval >= 0) {
        await sleep(options.retryInterval);
      }
    } while (defaultRetry-- > 0);

    if (options.throwOriginError) {
      throw error;
    } else {
      throw new MidwayRetryExceededMaxTimesError(
        retryFn.name || 'anonymous',
        retryTimes,
        error
      );
    }
  }) as any;
}

/**
 * wrap sync function with retry
 * @param retryFn
 * @param retryTimes
 * @param options
 */
export function retryWith<T extends (...args) => unknown>(
  retryFn: T,
  retryTimes = 1,
  options: {
    throwOriginError?: boolean;
    receiver?: any;
  } = {}
): (...args: Parameters<T>) => ReturnType<T> {
  let defaultRetry = retryTimes;
  let error;

  return ((...args: Parameters<T>) => {
    do {
      try {
        return retryFn.bind(options.receiver || this)(...args);
      } catch (err) {
        error = err;
      }
    } while (defaultRetry-- > 0);

    if (options.throwOriginError) {
      throw error;
    } else {
      throw new MidwayRetryExceededMaxTimesError(
        retryFn.name || 'anonymous',
        retryTimes,
        error
      );
    }
  }) as any;
}
