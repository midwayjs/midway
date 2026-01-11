import { Inject, Provide } from '@midwayjs/core';
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
});
