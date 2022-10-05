import {
  CATCH_KEY,
  getClassMetadata,
  MATCH_KEY,
  MatchPattern,
} from '../decorator';
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
  private exceptionMap: WeakMap<
    Error,
    {
      filter: IFilter<CTX, R, N>;
      catchOptions: {
        matchPrototype?: boolean;
      };
    }
  > = new WeakMap();
  private defaultErrFilter = undefined;
  private matchFnList = [];
  private protoMatchList = [];

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
        exceptionMetadata.catchOptions = exceptionMetadata.catchOptions || {};
        for (const Exception of exceptionMetadata.catchTargets) {
          this.exceptionMap.set(Exception, {
            filter,
            catchOptions: exceptionMetadata.catchOptions,
          });
          if (exceptionMetadata.catchOptions['matchPrototype']) {
            this.protoMatchList.push(err => {
              if (err instanceof Exception) {
                return Exception;
              } else {
                return false;
              }
            });
          }
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
    let matched = false;
    if (this.exceptionMap.has((err as any).constructor)) {
      matched = true;
      const filterData = this.exceptionMap.get((err as any).constructor);
      result = await filterData.filter.catch(err, ctx, res, next);
    }

    // match with prototype
    if (!matched && this.protoMatchList.length) {
      let protoException;
      for (const matchPattern of this.protoMatchList) {
        protoException = matchPattern(err);
        if (protoException) {
          break;
        }
      }
      if (protoException) {
        matched = true;
        const filterData = this.exceptionMap.get(protoException);
        result = await filterData.filter.catch(err, ctx, res, next);
      }
    }

    if (!matched && this.defaultErrFilter) {
      matched = true;
      result = await this.defaultErrFilter.catch(err, ctx, res, next);
    }

    if (!matched) {
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
      if (matchData.matchFn(ctx, res)) {
        returnValue = await matchData.target.match(returnValue, ctx, res, next);
      }
    }

    return {
      result: returnValue,
      error: undefined,
    };
  }
}
