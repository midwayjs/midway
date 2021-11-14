import { createRuntime, HTTPEvent } from '../src';
import { join } from 'path';

describe('/test/index.test.ts', () => {
  it('should create runtime', async () => {
    let initHandlerResult;
    const runtime = createRuntime({
      functionDir: join(__dirname, './code'),
      events: [new HTTPEvent()],
      initHandler: arg => {
        initHandlerResult = arg;
      },
      initContext: 'test'
    });
    await runtime.start();
    await runtime.close();
    expect(initHandlerResult).toEqual('test');
  });
});
