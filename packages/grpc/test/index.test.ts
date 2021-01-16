import { createServer, closeApp, createGRPCConsumer } from './utils';
import { join } from 'path';
// import { hero } from './fixtures/base-app/src/interface';

describe('/test/index.test.ts', function () {

  it('should create grpc server', async () => {
    const app = await createServer('base-app', {
      protoPath: join(__dirname, 'fixtures/proto/hero.proto'),
      package: 'hero',
      port: 6565
    });

    const service: any = await createGRPCConsumer({
      package: 'hero',
      protoPath: join(__dirname, 'fixtures/proto/hero.proto'),
      host: '127.0.0.1',
      port: 6565
    });

    const result = await new Promise((resolve, reject) => {
      service.findOne({
        id: 123
      },(err, response) => {
        if (err) {
          reject(err);
        }
        console.log('Greeting:', response.message);
        resolve(response);
      });
    })

    console.log(result);

    expect(app.getAppDir()).toBeTruthy();
    expect(app.getApplicationContext()).toBeTruthy();
    await closeApp(app);
  });
});
