import { CATCH_KEY, getClassMetadata } from '@midwayjs/decorator';
import {
  CommonExceptionFilterUnion,
  IExceptionFilter,
  IMidwayContainer,
  IMidwayContext,
} from '../interface';

export class ExceptionFilterManager<
  T extends IMidwayContext = IMidwayContext,
  R = any,
  N = any
> {
  private filterList: Array<new (...args) => IExceptionFilter<T, R, N>> = [];
  private exceptionMap: WeakMap<Error, IExceptionFilter<T, R, N>> =
    new WeakMap();
  private defaultFilter = undefined;

  public useFilter(Filter: CommonExceptionFilterUnion<T, R, N>) {
    if (Array.isArray(Filter)) {
      this.filterList.push(...Filter);
    } else {
      this.filterList.push(Filter);
    }
  }

  public async init(applicationContext: IMidwayContainer) {
    for (const FilterClass of this.filterList) {
      const filter = await applicationContext.getAsync(FilterClass);
      const exceptionMetadata = getClassMetadata(CATCH_KEY, FilterClass);
      if (exceptionMetadata && exceptionMetadata.catchTargets) {
        for (const Exception of exceptionMetadata.catchTargets) {
          this.exceptionMap.set(Exception, filter);
        }
      } else {
        // default filter
        this.defaultFilter = filter;
      }
    }
  }

  public async run(
    err: Error,
    ctx: T,
    res?: R,
    next?: N
  ): Promise<{
    result: any;
    error: any;
  }> {
    let result, error;
    if (this.exceptionMap.has((err as any).constructor)) {
      const filter = this.exceptionMap.get((err as any).constructor);
      result = await filter.catch(err, ctx, res, next);
    } else if (this.defaultFilter) {
      result = await this.defaultFilter.catch(err, ctx, res, next);
    } else {
      error = err;
    }
    return {
      result,
      error,
    };
  }
}
