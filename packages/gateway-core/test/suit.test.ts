import { createExpressSuit, createKoaSuit } from '../src';

describe('/test.suit.test.ts', () => {
  it('test express', done => {
    createExpressSuit({
      gatewayDir: __dirname,
    })
      .get('/test')
      .expect(/321/)
      .expect(200, done);
  });

  it('test koa', done => {
    createKoaSuit({
      gatewayDir: __dirname,
    })
      .get('/test')
      .expect(/123/)
      .expect(200, done);
  });
});
