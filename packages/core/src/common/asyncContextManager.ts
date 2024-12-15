/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { AsyncLocalStorage } from 'async_hooks';

export interface AsyncContext {
  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: symbol): unknown;

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: symbol, value: unknown): AsyncContext;

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: symbol): AsyncContext;
}

export interface AsyncContextManager {
  /**
   * Get the current active context
   */
  active(): AsyncContext;

  /**
   * Run the fn callback with object set as the current active context
   * @param context Any object to set as the current active context
   * @param fn A callback to be immediately run within a specific context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: AsyncContext,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F>;

  /**
   * Bind an object as the current context (or a specific one)
   * @param [context] Optionally specify the context which you want to assign
   * @param target Any object to which a context need to be set
   */
  bind<T>(context: AsyncContext, target: T): T;

  /**
   * Enable context management
   */
  enable(): this;

  /**
   * Disable context management
   */
  disable(): this;
}

class AsyncBaseContext implements AsyncContext {
  private _currentContext!: Map<symbol, unknown>;

  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext?: Map<symbol, unknown>) {
    // for minification
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    self._currentContext = parentContext ? new Map(parentContext) : new Map();

    self.getValue = (key: symbol) => self._currentContext.get(key);

    self.setValue = (key: symbol, value: unknown): AsyncContext => {
      const context = new AsyncBaseContext(self._currentContext);
      context._currentContext.set(key, value);
      return context;
    };

    self.deleteValue = (key: symbol): AsyncContext => {
      const context = new AsyncBaseContext(self._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }

  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  public getValue!: (key: symbol) => unknown;

  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  public setValue!: (key: symbol, value: unknown) => AsyncContext;

  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  public deleteValue!: (key: symbol) => AsyncContext;
}

/** The root context is used as the default parent context when there is no active context */
export const ASYNC_ROOT_CONTEXT: AsyncContext = new AsyncBaseContext();

export class NoopContextManager implements AsyncContextManager {
  active(): AsyncContext {
    return ASYNC_ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    _context: AsyncContext,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    return fn.call(thisArg, ...args);
  }

  bind<T>(_context: AsyncContext, target: T): T {
    return target;
  }

  enable(): this {
    return this;
  }

  disable(): this {
    return this;
  }
}

export class AsyncLocalStorageContextManager implements AsyncContextManager {
  private _asyncLocalStorage: AsyncLocalStorage<AsyncContext>;

  constructor() {
    this._asyncLocalStorage = new AsyncLocalStorage();
  }

  active(): AsyncContext {
    return this._asyncLocalStorage.getStore() ?? ASYNC_ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: AsyncContext,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    const cb = thisArg == null ? fn : fn.bind(thisArg);
    return this._asyncLocalStorage.run(context, cb as never, ...args);
  }

  enable(): this {
    return this;
  }

  disable(): this {
    this._asyncLocalStorage.disable();
    return this;
  }

  /**
   * Binds a the certain context or the active one to the target function and then returns the target
   * @param context A context (span) to be bind to target
   * @param target a function. When target or one of its callbacks is called,
   *  the provided context will be used as the active context for the duration of the call.
   */
  bind<T>(context: AsyncContext, target: T): T {
    if (typeof target === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const manager = this;
      const contextWrapper = function (this: never, ...args: unknown[]) {
        return manager.with(context, () => target.apply(this, args));
      };
      Object.defineProperty(contextWrapper, 'length', {
        enumerable: false,
        configurable: true,
        writable: false,
        value: target.length,
      });
      /**
       * It isn't possible to tell Typescript that contextWrapper is the same as T
       * so we forced to cast as any here.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return contextWrapper as any;
    }
    return target;
  }
}
