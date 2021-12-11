import {
  CommonMiddleware,
  CommonMiddlewareUnion,
  IMidwayContext,
} from '../interface';

export class ContextMiddlewareManager<
  CTX extends IMidwayContext,
  R,
  N
> extends Array<CommonMiddleware<CTX, R, N>> {
  /**
   * insert a middleware or middleware array to first
   * @param middleware
   */
  public insertFirst(middleware: CommonMiddlewareUnion<CTX, R, N>) {
    if (Array.isArray(middleware)) {
      this.unshift(...middleware);
    } else {
      this.unshift(middleware);
    }
  }

  /**
   * insert a middleware or middleware array to last
   * @param middleware
   */
  public insertLast(middleware: CommonMiddlewareUnion<CTX, R, N>) {
    if (Array.isArray(middleware)) {
      this.push(...middleware);
    } else {
      this.push(middleware);
    }
  }

  /**
   * insert a middleware or middleware array to after another middleware
   * @param middleware
   * @param idxOrBeforeMiddleware
   */
  public insertBefore(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrBeforeMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ) {
    if (typeof idxOrBeforeMiddleware !== 'number') {
      idxOrBeforeMiddleware = this.findItemIndex(idxOrBeforeMiddleware);
    }
    if (Array.isArray(middleware)) {
      this.splice(idxOrBeforeMiddleware, 0, ...middleware);
    } else {
      this.splice(idxOrBeforeMiddleware, 0, middleware);
    }
  }

  /**
   * insert a middleware or middleware array to after another middleware
   * @param middleware
   * @param idxOrAfterMiddleware
   */
  public insertAfter(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrAfterMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ) {
    if (typeof idxOrAfterMiddleware !== 'number') {
      idxOrAfterMiddleware = this.findItemIndex(idxOrAfterMiddleware);
    }
    if (Array.isArray(middleware)) {
      this.splice(idxOrAfterMiddleware + 1, 0, ...middleware);
    } else {
      this.splice(idxOrAfterMiddleware + 1, 0, middleware);
    }
  }

  /**
   * move a middleware after another middleware
   * @param middlewareOrName
   * @param afterMiddleware
   */
  public findAndInsertAfter(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string,
    afterMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ) {
    middlewareOrName = this.findItem(middlewareOrName);
    afterMiddleware = this.findItem(afterMiddleware);
    if (
      !middlewareOrName ||
      !afterMiddleware ||
      middlewareOrName === afterMiddleware
    ) {
      return;
    }
    if (afterMiddleware) {
      const mw = this.remove(middlewareOrName);
      if (mw) {
        this.insertAfter(mw, afterMiddleware);
      }
    }
  }

  /**
   * move a middleware before another middleware
   * @param middlewareOrName
   * @param beforeMiddleware
   */
  public findAndInsertBefore(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string,
    beforeMiddleware: CommonMiddleware<CTX, R, N> | string | number
  ) {
    middlewareOrName = this.findItem(middlewareOrName);
    beforeMiddleware = this.findItem(beforeMiddleware);
    if (
      !middlewareOrName ||
      !beforeMiddleware ||
      middlewareOrName === beforeMiddleware
    ) {
      return;
    }
    if (beforeMiddleware) {
      const mw = this.remove(middlewareOrName);
      if (mw) {
        this.insertBefore(mw, beforeMiddleware);
      }
    }
  }

  /**
   * find middleware and move to first
   * @param middlewareOrName
   */
  public findAndInsertFirst(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string
  ) {
    const mw = this.remove(middlewareOrName);
    if (mw) {
      this.insertFirst(mw);
    }
  }

  /**
   * find middleware and move to last
   * @param middlewareOrName
   */
  public findAndInsertLast(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string
  ) {
    const mw = this.remove(middlewareOrName);
    if (mw) {
      this.insertLast(mw);
    }
  }

  /**
   * find a middleware and return index
   * @param middlewareOrName
   */
  public findItemIndex(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string | number
  ): number {
    if (typeof middlewareOrName === 'number') {
      return middlewareOrName;
    } else if (typeof middlewareOrName === 'string') {
      return this.findIndex(
        item => this.getMiddlewareName(item) === middlewareOrName
      );
    } else {
      return this.findIndex(item => item === middlewareOrName);
    }
  }

  public findItem(
    middlewareOrName: CommonMiddleware<CTX, R, N> | string | number
  ): CommonMiddleware<CTX, R, N> {
    if (typeof middlewareOrName === 'number') {
      if (middlewareOrName >= 0 && middlewareOrName <= this.length - 1) {
        return this[middlewareOrName as number];
      }
    } else if (typeof middlewareOrName === 'string') {
      return this.find(
        item => this.getMiddlewareName(item) === middlewareOrName
      );
    } else {
      return middlewareOrName;
    }
  }

  /**
   * get name from middleware
   * @param middleware
   */
  public getMiddlewareName(middleware: CommonMiddleware<CTX, R, N>): string {
    return (middleware as any)._name ?? middleware.name;
  }

  /**
   * remove a middleware
   * @param middlewareOrNameOrIdx
   */
  public remove(
    middlewareOrNameOrIdx: CommonMiddleware<CTX, R, N> | string | number
  ): CommonMiddleware<CTX, R, N> {
    if (
      typeof middlewareOrNameOrIdx === 'number' &&
      middlewareOrNameOrIdx !== -1
    ) {
      return this.splice(middlewareOrNameOrIdx, 1)[0];
    } else {
      const idx = this.findItemIndex(
        middlewareOrNameOrIdx as CommonMiddleware<CTX, R, N> | string
      );
      if (idx !== -1) {
        return this.splice(idx, 1)[0];
      }
    }
  }

  /**
   * get middleware name list
   */
  public getNames(): string[] {
    return this.map(item => {
      return this.getMiddlewareName(item);
    });
  }
}
