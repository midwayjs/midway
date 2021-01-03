import { createServer, closeApp } from './utils';
import { join } from 'path';

describe('/test/index.test.ts', function () {

  it('should create grpc server', async () => {
    const app = await createServer('base-app', {
      protoPath: join(__dirname, 'fixtures/proto/hero.proto'),
      package: 'hero'
    });
    expect(app.getAppDir()).toBeTruthy();
    expect(app.getApplicationContext()).toBeTruthy();
    await closeApp(app);
  });
});
