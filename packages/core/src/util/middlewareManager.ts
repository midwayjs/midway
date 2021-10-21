import {
  CommonMiddleware,
  CommonMiddlewareUnion,
  IMidwayContext,
} from '../interface';

export class ContextMiddlewareManager<
  T extends IMidwayContext = IMidwayContext
> extends Array<CommonMiddleware<T>> {
  public insertFirst(middleware: CommonMiddlewareUnion<T>) {
    this.unshift(middleware);
  }

  public insertBefore(idx: number, middleware: CommonMiddlewareUnion<T>);
  public insertBefore(idx: string, middleware: CommonMiddlewareUnion<T>);
  public insertBefore(idx: any, middleware: CommonMiddlewareUnion<T>) {
    if (typeof idx === 'string') {
      idx = this.indexOf(idx);
    }
    this.splice(idx, 0, middleware);
  }

  public insertAfter(idx: number | string, filter) {
    if (idx === 'string') {
      idx = this.indexOf(idx);
    }
    this.splice((idx as number) + 1, 0, filter);
  }

  public insertLast(filter) {
    this.push(filter);
  }

  private findItemIndex(middleware: CommonMiddleware<T>): number {
    return this.findIndex(item => {
      if (item.name === middleware.name) {
        return true;
      }
    });
  }
}
