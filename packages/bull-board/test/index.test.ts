import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

describe(`/test/index.test.ts`, () => {
  it('test ui in koa', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app-koa'));

    // page
    let result = await createHttpRequest(app).get('/ui');
    expect(result.status).toBe(200);
    expect(result.text).toMatch(/doctype html/);
    expect(result.headers['content-type']).toMatch(/text\/html/);

    // resource
    result = await createHttpRequest(app).get('/ui/static/images/logo.svg');
    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toMatch(/image\/svg\+xml/);

    // api
    result = await createHttpRequest(app).get('/ui/api/queues?activeQueue=&page=1&jobsPerPage=10');
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      "queues": []
    });
    expect(result.headers['content-type']).toMatch('application/json');

    await close(app);
  });

  it('test ui in express', async () => {
    const app = await createApp(join(__dirname, 'fixtures', 'base-app-express'));

    // page
    let result = await createHttpRequest(app).get('/bull-board');
    expect(result.status).toBe(200);
    expect(result.text).toMatch(/doctype html/);
    expect(result.headers['content-type']).toMatch(/text\/html/);

    // resource
    result = await createHttpRequest(app).get('/bull-board/static/images/logo.svg');
    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toMatch(/image\/svg\+xml/);

    // api
    result = await createHttpRequest(app).get('/bull-board/api/queues?activeQueue=&page=1&jobsPerPage=10');
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      "queues": []
    });
    expect(result.headers['content-type']).toMatch('application/json');

    await close(app);
  });
});
