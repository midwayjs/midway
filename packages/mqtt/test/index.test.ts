import { createApp, close } from '@midwayjs/mock';
import { sleep } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test subscribe topic and send message', async () => {
    // create app and got data
    const app = await createApp('base-app');
    await sleep();
    expect(app.getAttr('subscribe')).toBe(true);
    await close(app);
  });

  it('should test subscribe with no pub and sub', async () => {
    // create app and got data
    const app = await createApp('base-app-no-pub-sub');
    await sleep();
    await close(app);
  });
});
