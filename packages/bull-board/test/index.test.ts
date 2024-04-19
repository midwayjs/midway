import { createApp, close, createHttpRequest, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as bullboard from '../src';

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

  it('should test bullboard manager', async () => {
    const app = await createLightApp('', {
      imports: [bullboard],
    });
    const manager = await app.getApplicationContext().getAsync(bullboard.BullBoardManager);
    expect(manager).toBeDefined();
    expect(manager.getBullBoardOrigin()).toBeUndefined();

    // set bull board
    const bullBoard = {
      addQueue: () => {},
      removeQueue: () => {},
      replaceQueues: () => {},
      setQueues: () => {},
    };

    manager.setBullBoard(bullBoard);
    expect(manager.getBullBoardOrigin()).toBe(bullBoard);

    await close(app);
  });
});
