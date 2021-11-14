import { createApp, close } from '@midwayjs/mock';
import { QueueTask } from './fixtures/base-app/src/task/queue.task';
import { join } from 'path';
import { sleep } from '@midwayjs/decorator';
import * as TaskModule from '../src';

describe(`midway task`, () => {
  let app: TaskModule.Application;

  beforeAll(async () => {
    app = await createApp(join(__dirname, 'fixtures', 'base-app'), {}, TaskModule);
  });

  afterAll(async () => {
    await close(app);
  });

  it('local task', async () => {
    await sleep(3 * 1000);
    let res = app.getApplicationContext().get(`name`);
    expect(res).toEqual(`taskLocal`)
  })

  it('task', async () => {
    await sleep(3 * 1000);
    let res = app.getApplicationContext().get(`task`);
    expect(res).toEqual(`task`)
  })

  it('add task to queue', async () => {
    let ctx = app.createAnonymousContext();
    expect(() => app.getApplicationContext().get(`queueConfig`)).toThrow();
    let service = await ctx.requestContext.getAsync(`task:queueService`);
    let params: any = {
      name: 'stone-jin'
    };
    (service as any).execute(QueueTask, params, {delay: 1000});
    await sleep(3 * 1000);
    expect(app.getApplicationContext().get(`queueConfig`)).toBe(JSON.stringify(params));
  })

  it(`stop queue`, async () => {
    let ctx = app.createAnonymousContext();
    let service = await ctx.requestContext.getAsync(`task:queueService`);
    expect((service as any).getClassQueue(QueueTask)).not.toBeNull();
  })
})
