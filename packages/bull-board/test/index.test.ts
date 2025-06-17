import { createLegacyApp, close, createHttpRequest, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as bullboard from '../src';
import * as bullmq from '@midwayjs/bullmq';
import * as bull from '@midwayjs/bull';
import * as koa from '@midwayjs/koa';

describe(`/test/index.test.ts`, () => {
  it('test ui in koa', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-koa'));

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
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-express'));

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

  it('test using package bullmq', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app-bullmq'));

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const testQueue = bullFramework.getQueue('test');
    await testQueue?.runJob({name: 'stone-jin'});
    // page
    let result = await createHttpRequest(app).get('/ui');
    expect(result.status).toBe(200);
    expect(result.text).toMatch(/doctype html/);
    expect(result.headers['content-type']).toMatch(/text\/html/);

    result = await createHttpRequest(app).get('/ui/api/queues?activeQueue=test&page=1&jobsPerPage=10');
    expect(result.status).toBe(200);
    expect(result.body.queues.length).toBe(1);
    expect(result.body.queues[0].type).toBe('bullmq');
    expect(result.headers['content-type']).toMatch('application/json');

    await close(app);
  });

  it('test dynamic add queue with bullmq', async () => {
    const app = await createLightApp('', {
      imports: [koa, bullboard, bullmq],
      globalConfig: {
        keys: 123,
        bullmq: {
          defaultConnection: {
            host: '127.0.0.1',
            port: 6379,
          }
        },
      }
    });

    const bullFramework = app.getApplicationContext().get(bullmq.Framework);
    const testQueue = bullFramework.createQueue('test');
    await testQueue?.addJobToQueue({name: 'stone-jin'});

    const manager = await app.getApplicationContext().getAsync(bullboard.BullBoardManager);
    manager.addQueue(new bullboard.BullMQAdapter(testQueue) as any);

    const result = await createHttpRequest(app).get('/ui/api/queues?activeQueue=test&page=1&jobsPerPage=10');
    expect(result.status).toBe(200);
    expect(result.body.queues.length).toBe(1);
    expect(result.body.queues[0].type).toBe('bullmq');
    expect(result.headers['content-type']).toMatch('application/json');

    await close(app);
  });

  it('test dynamic add queue with bull', async () => {
    const app = await createLightApp('', {
      imports: [koa, bullboard, bull],
      globalConfig: {
        keys: 123,
        bull: {
          defaultQueueOptions: {
            redis: {
              port: 6379,
              host: '127.0.0.1',
            },
          }
        },
      }
    });

    const bullFramework = app.getApplicationContext().get(bull.Framework);
    const testQueue = bullFramework.createQueue('test-bull-board');
    await testQueue?.addJobToQueue({name: 'stone-jin'});

    const manager = await app.getApplicationContext().getAsync(bullboard.BullBoardManager);
    manager.addQueue(new bullboard.BullAdapter(testQueue));

    const result = await createHttpRequest(app).get('/ui/api/queues?activeQueue=test&page=1&jobsPerPage=10');
    expect(result.status).toBe(200);
    expect(result.body.queues.length).toBe(1);
    expect(result.body.queues[0].type).toBe('bull');
    expect(result.headers['content-type']).toMatch('application/json');

    await close(app);
  });
});
