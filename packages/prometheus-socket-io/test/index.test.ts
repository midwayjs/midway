import { createLegacyApp, createHttpRequest, close } from '@midwayjs/mock';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  it('should get metrics', async() => {
    const app = await createLegacyApp(join(__dirname, './fixtures/test-prometheus-socket-io'));
    const result = await createHttpRequest(app)
      .get('/metrics');

    expect(result.status).toEqual(200);
    await close(app);
  });
});

