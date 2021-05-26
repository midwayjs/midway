import { createApp, close } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa'
import { QueueTask } from './fixtures/base-app/src/task/queue.task';

describe(`midway task`, ()=>{
  let app: Application;

  beforeAll(async ()=>{
    app = await createApp('base-app', {}, Framework);
  });

  afterAll(async ()=>{
    await close(app);
  });

  it('local task', async (done)=>{
    setTimeout(()=>{
      let res = app.getApplicationContext().get(`name`);
      expect(res).toEqual(`taskLocal`)
      done();
    }, 3 * 1000)
  })

  it('task', async (done)=>{
    setTimeout(()=>{
      let res = app.getApplicationContext().get(`task`);
      expect(res).toEqual(`task`)
      done();
    }, 3 * 1000)
  })

  it('add task to queue', async (done)=>{
    let ctx = app.createAnonymousContext();
    expect(()=>app.getApplicationContext().get(`queueConfig`)).toThrow();
    let service = await ctx.requestContext.getAsync(`task:queueService`);
    let params: any = {
      name: 'stone-jin'
    };
    (service as any).execute(QueueTask, params, {delay: 1000});
    setTimeout(()=>{
      expect(app.getApplicationContext().get(`queueConfig`)).toBe(JSON.stringify(params));
      done();
    }, 2000);
  })

  it(`stop queue`, async (done)=>{
    let ctx = app.createAnonymousContext();
    let service = await ctx.requestContext.getAsync(`task:queueService`);
    expect((service as any).getClassQueue(QueueTask)).not.toBeNull();
    done();
  })
})
