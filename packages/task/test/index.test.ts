import { createApp, close } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa'

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
    }, 10 * 1000)
  })
})