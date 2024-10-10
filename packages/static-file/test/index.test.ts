import { close, createApp, createFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import { Framework } from '@midwayjs/faas';

describe('test/index.test.ts', () => {
  it('serve with dirs with same prefix', async () => {
    const app = await createApp(join(__dirname, './fixtures/koa-with-dirs'));
    const result = await createHttpRequest(app).get('/foo.js');
    expect(result.text).toMatch('console');

    const result1 = await createHttpRequest(app).get('/index.html');
    expect(result1.text).toMatch('<body>hello</body>');
    await close(app);
  });

  it('serve with dirs with different prefix', async () => {
    const app = await createApp(join(__dirname, './fixtures/koa-with-different-dirs'));
    const result = await createHttpRequest(app).get('/foo.js');
    expect(result.text).toMatch('console');

    const result1 = await createHttpRequest(app).get('/static/index.html');
    expect(result1.text).toMatch('<body>hello</body>');

    const result2 = await createHttpRequest(app).get('/foo.js').set('range', 'bytes=0-10');
    expect(result2.get('content-length')).toEqual('11');
    expect(result2.get('Accept-Ranges')).toEqual('bytes');
    expect(result2.get('Content-Range')).toEqual('bytes 0-10/20');
    await close(app);
  });

  it('should test faas use static', async () => {
    const appDir = join(__dirname, 'fixtures/faas-with-dirs');
    const app = await createFunctionApp<Framework>(appDir);
    const result = await createHttpRequest(app).get('/foo.js');
    expect(result.text).toMatch('console');
    await close(app);
  });
});
