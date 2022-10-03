import {
  getClassMetadata,
} from '@midwayjs/decorator';
import {
  CommonGuardUnion,
  IGuard,
  IMidwayContainer,
  IMidwayContext,
} from '../interface';
import { ForbiddenError } from '../error/http';

export class GuardManager<
  CTX extends IMidwayContext = IMidwayContext,
  > {
  private globalGuardList: Set<new (...args) => IGuard<CTX>> = new Set();
  public async init(applicationContext: IMidwayContainer) {
    // got global guard class

  }

  public addGlobalGuard(Guards: CommonGuardUnion<CTX>) {
    if (!Array.isArray(Guards)) {
      Guards = [Guards];
    }
    for (const Guard of Guards) {
      this.globalGuardList.add(Guard);
    }
  }

  public async runGuards(ctx: CTX, supplierClz: new (...args) => any, methodName: string) {
    // check global guard
    for (const Guard of this.globalGuardList) {
      const guard = await ctx.requestContext.getAsync(Guard);
      const isPassed = await guard.canActivate(ctx, supplierClz, methodName);
      if (!isPassed) {
        throw new ForbiddenError();
      }
    }

    // check class Guard

    // check method Guard
  }
}
