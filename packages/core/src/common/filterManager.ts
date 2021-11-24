import {
  CATCH_KEY,
  getClassMetadata,
  MATCH_KEY,
  MatchPattern,
} from '@midwayjs/decorator';
import {
  CommonFilterUnion,
  IFilter,
  IMidwayContainer,
  IMidwayContext,
} from '../interface';
import { toPathMatch } from '../util';

export class FilterManager<
  CTX extends IMidwayContext = IMidwayContext,
  R = any,
  N = any
> {
  private errFilterList: Array<new (...args) => IFilter<CTX, R, N>> = [];
  private successFilterList: Array<new (...args) => IFilter<CTX, R, N>> = [];
  private exceptionMap: WeakMap<Error, IFilter<CTX, R, N>> = new WeakMap();
  private defaultErrFilter = undefined;
  private matchFnList = [];

  public useFilter(Filters: CommonFilterUnion<CTX, R, N>) {
    if (!Array.isArray(Filters)) {
      Filters = [Filters];
    }
    for (const Filter of Filters) {
      if (getClassMetadata(CATCH_KEY, Filter)) {
        this.errFilterList.push(Filter);
      }
      if (getClassMetadata(MATCH_KEY, Filter)) {
        this.successFilterList.push(Filter);
      }
    }
  }

  public async init(applicationContext: IMidwayContainer) {
    // for catch exception
    for (const FilterClass of this.errFilterList) {
      const filter = await applicationContext.getAsync(FilterClass);
      const exceptionMetadata = getClassMetadata(CATCH_KEY, FilterClass);
      if (exceptionMetadata && exceptionMetadata.catchTargets) {
        for (const Exception of exceptionMetadata.catchTargets) {
          this.exceptionMap.set(Exception, filter);
        }
      } else {
        // default filter
        this.defaultErrFilter = filter;
      }
    }

    // for success return
    for (const FilterClass of this.successFilterList) {
      const filter = await applicationContext.getAsync(FilterClass);
      const matchMetadata: {
        matchPattern?: MatchPattern<CTX>;
      } = getClassMetadata(MATCH_KEY, FilterClass);
      if (matchMetadata && matchMetadata.matchPattern) {
        this.matchFnList.push({
          matchFn: toPathMatch(matchMetadata.matchPattern),
          target: filter,
        });
      }
    }
  }

  public async runErrorFilter(
    err: Error,
    ctx: CTX,
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
    } else if (this.defaultErrFilter) {
      result = await this.defaultErrFilter.catch(err, ctx, res, next);
    } else {
      error = err;
    }
    return {
      result,
      error,
    };
  }

  public async runResultFilter(
    result: any,
    ctx: CTX,
    res?: R,
    next?: N
  ): Promise<{
    result: any;
    error: any;
  }> {
    let returnValue = result;

    for (const matchData of this.matchFnList) {
      if (matchData.matchFn(ctx)) {
        returnValue = await matchData.target.match(returnValue, ctx, res, next);
      }
    }

    return {
      result: returnValue,
      error: undefined,
    };
  }
}
