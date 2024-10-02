import { CommonGuardUnion, IGuard, IMidwayContext } from '../interface';
import { GUARD_KEY } from '../decorator';
import { MetadataManager } from '../decorator/metadataManager';

export class GuardManager<
  CTX extends IMidwayContext = IMidwayContext
> extends Array<new (...args) => IGuard<any>> {
  public addGlobalGuard(guards: CommonGuardUnion<CTX>) {
    if (!Array.isArray(guards)) {
      this.push(guards);
    } else {
      this.push(...guards);
    }
  }

  public async runGuard(
    ctx: CTX,
    supplierClz: new (...args) => any,
    methodName: string
  ) {
    // check global guard
    for (const Guard of this) {
      const guard = await ctx.requestContext.getAsync<IGuard<any>>(Guard);
      const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
      if (!isPassed) {
        return false;
      }
    }

    // check class Guard
    const classGuardList = MetadataManager.getOwnMetadata(
      GUARD_KEY,
      supplierClz
    );
    if (classGuardList) {
      for (const Guard of classGuardList) {
        const guard = await ctx.requestContext.getAsync<IGuard<any>>(Guard);
        const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
        if (!isPassed) {
          return false;
        }
      }
    }

    // check method Guard
    const methodGuardList = MetadataManager.getOwnMetadata(
      GUARD_KEY,
      supplierClz,
      methodName
    );
    if (methodGuardList) {
      for (const Guard of methodGuardList) {
        const guard = await ctx.requestContext.getAsync<IGuard<any>>(Guard);
        const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
        if (!isPassed) {
          return false;
        }
      }
    }
    return true;
  }
}
