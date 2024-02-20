import { createApp, close } from '@midwayjs/mock';
import { sleep } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  it('should test subscribe topic and send message', async () => {
    // create app and got data
    const app = await createApp('base-app');
    await sleep();
    await close(app);
  });
});
