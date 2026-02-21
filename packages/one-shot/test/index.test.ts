import { Inject, MidwayTraceService, Provide } from '@midwayjs/core';
import { close, createLightApp } from '@midwayjs/mock';
import {
  Context,
  Framework,
  OneShotRunner,
} from '../src';

@Provide()
class SampleScript implements OneShotRunner<{ id: number }, string> {
  @Inject()
  ctx: Context;

  async run(payload?: { id: number }): Promise<string> {
    return `${payload?.id}:${(this.ctx.payload as { id?: number })?.id}`;
  }
}

describe('one-shot framework', () => {
  it('should run script with payload and context', async () => {
    const app = await createLightApp({
      imports: [require('../src')],
      preloadModules: [SampleScript],
    });

    const framework = app.getFramework() as Framework;
    const result = await framework.runScript(SampleScript, { id: 42 });

    expect(result).toEqual('42:42');

    await close(app);
  });

  it('should create entry span when running script', async () => {
    const app = await createLightApp({
      imports: [require('../src')],
      preloadModules: [SampleScript],
    });

    const traceService = await app
      .getApplicationContext()
      .getAsync(MidwayTraceService);
    const rawRunWithEntrySpan = traceService.runWithEntrySpan.bind(traceService);
    let called = 0;
    traceService.runWithEntrySpan = async (...args: any[]) => {
      called++;
      return rawRunWithEntrySpan(...args);
    };

    const framework = app.getFramework() as Framework;
    await framework.runScript(SampleScript, { id: 1 });

    expect(called).toBeGreaterThan(0);
    await close(app);
  });
});
