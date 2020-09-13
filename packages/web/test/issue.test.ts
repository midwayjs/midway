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
});
