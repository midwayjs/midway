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

import {
  AsyncContext,
  ASYNC_ROOT_CONTEXT,
  AsyncContextManager,
} from '@midwayjs/core';
import { AsyncLocalStorage } from 'async_hooks';

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
