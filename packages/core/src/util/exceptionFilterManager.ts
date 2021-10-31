import { CATCH_KEY, getClassMetadata } from '@midwayjs/decorator';
import {
  CommonExceptionFilterUnion,
  IExceptionFilter,
  IMidwayContainer,
} from '../interface';

export class ExceptionFilterManager<CTX> {
  private filterList: Array<new (...args) => IExceptionFilter<CTX>> = [];
  private exceptionMap: WeakMap<Error, IExceptionFilter<any>> = new WeakMap();
  private defaultFilter = undefined;

  public useFilter(Filter: CommonExceptionFilterUnion<CTX>) {
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
    err,
    ctx
  ): Promise<{
    result: any;
    error: any;
  }> {
    let result, error;
    if (this.exceptionMap.has(err.constructor)) {
      const filter = this.exceptionMap.get(err.constructor);
      result = await filter.catch(err, ctx);
    } else if (this.defaultFilter) {
      result = await this.defaultFilter.catch(err, ctx);
    } else {
      error = err;
    }
    return {
      result,
      error,
    };
  }
}
