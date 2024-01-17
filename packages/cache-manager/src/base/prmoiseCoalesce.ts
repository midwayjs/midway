/**
 * for from https://github.com/douglascayers/promise-coalesce/blob/main/src/coalesce.ts
 * reason: Support node.js >= v12
 */
interface PromiseCallback<T = any, E = Error> {
  resolve: ResolveFunction<T>;
  reject: RejectFunction<E>;
}

type ResolveFunction<T = any> = (value: T | PromiseLike<T>) => void;

type RejectFunction<E = Error> = (reason: E) => void;

const callbacks = new Map<string, Array<PromiseCallback<any>>>();

/**
 * Enqueue a promise for the group identified by `key`.
 *
 * All requests received for the same key while a request for that key
 * is already being executed will wait. Once the running request settles
 * then all the waiting requests in the group will settle, too.
 * This minimizes how many times the function itself runs at the same time.
 * This function resolves or rejects according to the given function argument.
 */
export async function coalesceAsync<T>(
  /**
   * Any identifier to group requests together.
   */
  key: string,
  /**
   * The function to run.
   */
  fn: () => T | PromiseLike<T>
): Promise<T> {
  if (!hasKey(key)) {
    addKey(key);
    try {
      const result = await Promise.resolve(fn());
      coalesce({ key, result });
      return result;
    } catch (error) {
      coalesce({ key, error });
      throw error;
    }
  }
  return enqueue(key);
}

function hasKey(key: string): boolean {
  return callbacks.has(key);
}

function addKey(key: string): void {
  callbacks.set(key, []);
}

function removeKey(key: string): void {
  callbacks.delete(key);
}

function addCallbackToKey<T>(key: string, callback: PromiseCallback<T>): void {
  const stash = getCallbacksByKey<T>(key);
  stash.push(callback);
  callbacks.set(key, stash);
}

function getCallbacksByKey<T>(key: string): Array<PromiseCallback<T>> {
  return callbacks.get(key) ?? [];
}

function enqueue<T>(key: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const callback: PromiseCallback<T> = { resolve, reject };
    addCallbackToKey(key, callback);
  });
}

function dequeue<T>(key: string): Array<PromiseCallback<T>> {
  const stash = getCallbacksByKey<T>(key);
  removeKey(key);
  return stash;
}

function coalesce<T>(options: {
  key: string;
  error?: Error;
  result?: T;
}): void {
  const { key, error, result } = options;
  dequeue(key).forEach(callback => {
    if (error) {
      callback.reject(error);
    } else {
      callback.resolve(result);
    }
  });
}
