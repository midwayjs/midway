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
  public insertFirst(middleware: CommonMiddlewareUnion<CTX, R, N>) {
    if (Array.isArray(middleware)) {
      this.unshift(...middleware);
    } else {
      this.unshift(middleware);
    }
  }

  public insertBefore(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrBeforeMiddleware: number
  );
  public insertBefore(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrBeforeMiddleware: CommonMiddlewareUnion<CTX, R, N>
  );
  public insertBefore(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrBeforeMiddleware: any
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

  public insertAfter(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrAfterMiddleware: number
  );
  public insertAfter(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrAfterMiddleware: CommonMiddlewareUnion<CTX, R, N>
  );
  public insertAfter(
    middleware: CommonMiddlewareUnion<CTX, R, N>,
    idxOrAfterMiddleware: any
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

  public insertLast(middleware: CommonMiddlewareUnion<CTX, R, N>) {
    if (Array.isArray(middleware)) {
      this.push(...middleware);
    } else {
      this.push(middleware);
    }
  }

  private findItemIndex(middleware: CommonMiddleware<CTX, R, N>): number {
    return this.findIndex(item => item === middleware);
  }
}
