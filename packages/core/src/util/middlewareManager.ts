import {
  CommonMiddleware,
  CommonMiddlewareUnion,
  IMidwayContext,
} from '../interface';

export class ContextMiddlewareManager<
  T extends IMidwayContext = IMidwayContext
> extends Array<CommonMiddleware<T>> {
  public insertFirst(middleware: CommonMiddlewareUnion<T>) {
    if (Array.isArray(middleware)) {
      this.unshift(...middleware);
    } else {
      this.unshift(middleware);
    }
  }

  public insertBefore(
    middleware: CommonMiddlewareUnion<T>,
    idxOrBeforeMiddleware: number
  );
  public insertBefore(
    middleware: CommonMiddlewareUnion<T>,
    idxOrBeforeMiddleware: CommonMiddlewareUnion<T>
  );
  public insertBefore(
    middleware: CommonMiddlewareUnion<T>,
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
    middleware: CommonMiddlewareUnion<T>,
    idxOrAfterMiddleware: number
  );
  public insertAfter(
    middleware: CommonMiddlewareUnion<T>,
    idxOrAfterMiddleware: CommonMiddlewareUnion<T>
  );
  public insertAfter(
    middleware: CommonMiddlewareUnion<T>,
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

  public insertLast(middleware: CommonMiddlewareUnion<T>) {
    if (Array.isArray(middleware)) {
      this.push(...middleware);
    } else {
      this.push(middleware);
    }
  }

  private findItemIndex(middleware: CommonMiddleware<T>): number {
    return this.findIndex(item => item === middleware);
  }
}
