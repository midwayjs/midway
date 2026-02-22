import * as path from 'path';
import { createLightFramework } from './util';
import { MidwayTraceService } from '../src';
import { UserService } from './fixtures/base-app-trace/src/user.service';
import { propagation, trace as otelTrace } from '@opentelemetry/api';

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

  it('should fallback to callback when tracing is disabled', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    try {
      const appCtx = framework.getApplicationContext();
      const traceService = await appCtx.getAsync(MidwayTraceService);
      (traceService as any).tracingConfig = {
        enable: false,
        onError: 'ignore',
      };

      const result = await traceService.runWithEntrySpan(
        'http request',
        {
          attributes: {
            'midway.protocol': 'http',
          },
        },
        async span => {
          expect(span).toBeUndefined();
          return 'ok';
        }
      );

      expect(result).toEqual('ok');
    } finally {
      await framework.stop();
    }
  });

  it('should fallback to callback when component tracing is disabled', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    try {
      const appCtx = framework.getApplicationContext();
      const traceService = await appCtx.getAsync(MidwayTraceService);
      (traceService as any).tracingConfig = {
        enable: true,
        onError: 'ignore',
      };

      const result = await traceService.runWithEntrySpan(
        'http request',
        {
          enable: false,
          attributes: {
            'midway.protocol': 'http',
          },
        },
        async span => {
          expect(span).toBeUndefined();
          return 'ok';
        }
      );

      expect(result).toEqual('ok');
    } finally {
      await framework.stop();
    }
  });

  it('should respect fallback policy when trace operations fail', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    try {
      const appCtx = framework.getApplicationContext();
      const traceService = await appCtx.getAsync(MidwayTraceService);
      (traceService as any).tracingConfig = {
        enable: true,
        onError: 'ignore',
      };
      expect(() => {
        (traceService as any).handleTraceError(
          new Error('inject failed'),
          'inject exit context'
        );
      }).not.toThrow();

      (traceService as any).tracingConfig = {
        enable: true,
        onError: 'throw',
      };
      expect(() => {
        (traceService as any).handleTraceError(
          new Error('inject failed'),
          'inject exit context'
        );
      }).toThrow('inject failed');
    } finally {
      await framework.stop();
    }
  });

  it('should support custom getter/setter and span attributes', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    const extractSpy = jest
      .spyOn(propagation, 'extract')
      .mockImplementation((ctx: any, carrier: any, getter: any) => {
        getter.keys?.(carrier);
        return ctx;
      });
    const injectSpy = jest
      .spyOn(propagation, 'inject')
      .mockImplementation((ctx: any, carrier: any, setter: any) => {
        setter.set(carrier, 'traceparent', 'custom');
      });
    const tracerSpy = jest.spyOn(otelTrace, 'getTracer');

    try {
      const appCtx = framework.getApplicationContext();
      const traceService = await appCtx.getAsync(MidwayTraceService);
      let getterCalled = false;
      let setterCalled = false;
      let startSpanName = '';
      let startSpanAttributes = {};

      tracerSpy.mockReturnValue({
        startActiveSpan: (
          name: string,
          options: any,
          ctxOrCb: any,
          cbMaybe?: any
        ) => {
          startSpanName = name;
          startSpanAttributes = options?.attributes ?? {};
          const cb = typeof cbMaybe === 'function' ? cbMaybe : ctxOrCb;
          return cb({
            setStatus() {},
            recordException() {},
            end() {},
          });
        },
      } as any);

      await traceService.runWithEntrySpan(
        'custom.entry',
        {
          carrier: { traceparent: '00-abc-abc-01' },
          responseCarrier: {},
          getter: {
            get(carrier, key) {
              getterCalled = true;
              return carrier[key];
            },
            keys(carrier) {
              getterCalled = true;
              return Object.keys(carrier);
            },
          },
          setter: {
            set(carrier, key, value) {
              setterCalled = true;
              carrier[key] = value;
            },
          },
          attributes: {
            'midway.protocol': 'http',
            'midway.custom': 'yes',
          },
        },
        async () => 'ok'
      );

      expect(getterCalled).toBeTruthy();
      expect(setterCalled).toBeTruthy();
      expect(startSpanName).toEqual('custom.entry');
      expect(startSpanAttributes).toEqual({
        'midway.protocol': 'http',
        'midway.custom': 'yes',
      });
      expect(extractSpy).toHaveBeenCalled();
      expect(injectSpy).toHaveBeenCalled();
    } finally {
      extractSpy.mockRestore();
      injectSpy.mockRestore();
      tracerSpy.mockRestore();
      await framework.stop();
    }
  });

  it('should support tracing meta resolver for entry and exit', async () => {
    const framework = await createLightFramework(
      path.join(__dirname, './fixtures/base-app-trace/src')
    );
    const tracerSpy = jest.spyOn(otelTrace, 'getTracer');
    try {
      const appCtx = framework.getApplicationContext();
      const traceService = await appCtx.getAsync(MidwayTraceService);
      const spanAttrsList = [];

      tracerSpy.mockReturnValue({
        startActiveSpan: (
          _name: string,
          options: any,
          ctxOrCb: any,
          cbMaybe?: any
        ) => {
          spanAttrsList.push(options?.attributes ?? {});
          const cb = typeof cbMaybe === 'function' ? cbMaybe : ctxOrCb;
          return cb({
            setStatus() {},
            recordException() {},
            end() {},
          });
        },
      } as any);

      const metaResolver = ({ direction }) => ({
        'biz.direction': direction,
        'biz.flag': true,
      });

      await traceService.runWithEntrySpan(
        'entry.meta',
        {
          attributes: {
            'midway.protocol': 'http',
          },
          meta: metaResolver,
        },
        async () => 'ok'
      );

      await traceService.runWithExitSpan(
        'exit.meta',
        {
          carrier: {},
          attributes: {
            'midway.protocol': 'http-client',
          },
          meta: metaResolver,
        },
        async () => 'ok'
      );

      expect(spanAttrsList[0]).toMatchObject({
        'midway.protocol': 'http',
        'biz.direction': 'entry',
        'biz.flag': true,
      });
      expect(spanAttrsList[1]).toMatchObject({
        'midway.protocol': 'http-client',
        'biz.direction': 'exit',
        'biz.flag': true,
      });
    } finally {
      tracerSpy.mockRestore();
      await framework.stop();
    }
  });
});
