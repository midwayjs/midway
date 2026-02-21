import * as path from 'path';
import { createLightFramework } from './util';
import { MidwayTraceService } from '../src';
import { UserService } from './fixtures/base-app-trace/src/user.service';

describe('/test/trace.test.ts', () => {
  it('should support trace decorator and traceId on anonymous context', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    try {
      const appCtx = framework.getApplicationContext();
      const userService = await appCtx.getAsync(UserService);
      const traceService = await appCtx.getAsync(MidwayTraceService);
      const traceId = '1234567890abcdef1234567890abcdef';
      const span = {
        setStatus() {},
        end() {},
        recordException() {},
      } as any;

      traceService.createSpan = (_name, callback) => {
        return callback(span);
      };
      traceService.getTraceId = () => traceId;

      const data = await userService.invoke();
      expect(data).toEqual({
        ok: true,
      });

      let error;
      try {
        await userService.invokeError();
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();

      let ctxTraceId;
      await traceService.createSpan('ctx.trace', async () => {
        const ctx = framework.getApplication().createAnonymousContext();
        expect('traceId' in ctx).toBeTruthy();
        ctxTraceId = ctx.traceId;
        expect(ctxTraceId).toEqual(traceId);
        expect(ctxTraceId).toEqual(traceService.getTraceId());
      });

      expect(ctxTraceId).toBeDefined();
    } finally {
      await framework.stop();
    }
  });
});
