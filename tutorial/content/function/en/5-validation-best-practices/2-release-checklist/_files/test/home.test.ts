import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application } from '@midwayjs/koa';

describe('home api', () => {
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
    expect(res.body.message).toBe('Hello Midway Functional!');
  });

  // Exercise: add a test for GET /health
});
