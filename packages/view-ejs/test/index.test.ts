import { createLegacyApp, close, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

describe('/test/index.test.ts', () => {

  it('should render with locals', async () => {
    let app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {});

    const result = await createHttpRequest(app).get('/locals');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world\n');

    await close(app);
  });
});
