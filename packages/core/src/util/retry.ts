import { MidwayInvokeRetryOverMaxTimeError } from '../error';

export function retryWithAsync<T extends (...args) => Promise<unknown>>(
  retryFn: T,
  retryCount = 1,
  options: {
    throwOriginError?: boolean;
  } = {}
): (...args: Parameters<T>) => ReturnType<T> {
  let defaultRetry = retryCount;
  let error;

  return (async (...args: Parameters<T>) => {
    do {
      try {
        return await retryFn(...args);
      } catch (err) {
        error = err;
      }
    } while (defaultRetry-- > 0);

    if (options.throwOriginError) {
      throw error;
    } else {
      throw new MidwayInvokeRetryOverMaxTimeError(
        retryFn.name || 'anonymous',
        retryCount,
        error
      );
    }
  }) as any;
}

export function retryWith<T extends (...args) => unknown>(
  retryFn: T,
  retryCount = 1,
  options: {
    throwOriginError?: boolean;
  } = {}
): (...args: Parameters<T>) => ReturnType<T> {
  let defaultRetry = retryCount;
  let error;

  return ((...args: Parameters<T>) => {
    do {
      try {
        return retryFn(...args);
      } catch (err) {
        error = err;
      }
    } while (defaultRetry-- > 0);

    if (options.throwOriginError) {
      throw error;
    } else {
      throw new MidwayInvokeRetryOverMaxTimeError(
        retryFn.name || 'anonymous',
        retryCount,
        error
      );
    }
  }) as any;
}
