import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';

describe('home', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp(process.cwd());
  });

  afterAll(async () => {
    await close(app);
  });

  it('GET /', async () => {
    const res = await createHttpRequest(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Hello Midway!');
  });

  // 练习：给 GET /health 补一个断言 status 200 且 body.ok === true 的测试
});
