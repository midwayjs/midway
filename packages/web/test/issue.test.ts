import { creatApp, closeApp, createHttpRequest } from './utils';

describe('/test/issue.test.ts', () => {

  it('test #264 issue to fix ctx bind', async() => {
    const app = await creatApp('issue/base-app-lazyload-ctx');

    let result = await createHttpRequest(app).get('/api/code/list');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('Code: /api/code/list, User: /api/code/list, Hello Result');

    result = await createHttpRequest(app).get('/api/user/info');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('User: /api/user/info, Hello Result');

    result = await createHttpRequest(app).get('/api/code/list');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('Code: /api/code/list, User: /api/code/list, Hello Result');

    result = await createHttpRequest(app).get('/api/user/info');

    expect(result.status).toEqual(200);
    expect(result.text).toEqual('User: /api/user/info, Hello Result');

    await closeApp(app);
  });

  it('test #215 issue to fix egg extension', async () => {
    const app = await creatApp('issue/base-app-extend-context');
    let result = await createHttpRequest(app).get('/api/user/info');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello world');
    await closeApp(app);
  });

  it('test #683 issue to change ctx correct', async () => {
    const app = await creatApp('issue/base-app-aspect-throw');
    let result = await createHttpRequest(app).get('/api/user/info');
    expect(result.status).toEqual(200);
    expect(result.text).toEqual('hello');

    let result2 = await createHttpRequest(app).get('/api/user/info');
    expect(result2.status).toEqual(200);
    expect(result2.text).toEqual('hello');

    let result3 = await createHttpRequest(app).get('/api/user/ctx_bind').query({text: 'hello'});
    expect(result3.status).toEqual(200);
    expect(result3.text).toEqual('hello world');
    await closeApp(app);
  });
});

