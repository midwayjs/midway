import * as path from 'path';
import * as assert from 'assert';
import { createLightApp, close } from '@midwayjs/mock';
import { createCache } from 'cache-manager';
import { sleep } from '@midwayjs/core';

describe(`index.test.ts`, ()=>{

  describe('cache manager', () => {
    it('test cache manager wrap method', async () => {
      const memoryCache = await createCache({
        ttl: 10
      });
      let i = 0;
      const cached = await memoryCache.wrap('cache-manager-key', async () => {
        return i++;
      });
      expect(cached).toEqual(0);
    });
  });

  it(`test cache`, async () => {
    const app = await createLightApp(path.join(__dirname, './fixtures/cache-manager'));
    const appCtx = app.getApplicationContext();

    const userService: any = await appCtx.getAsync('userService');
    assert.ok((await userService.getUser(`name`)) === undefined);
    await userService.setUser('name', 'stone-jin');
    assert.ok((await userService.getUser(`name`)) === 'stone-jin');
    await userService.setUser('name', {name: '123'});
    assert.ok(JSON.stringify(await userService.getUser('name')) === JSON.stringify({name: '123'}));
    await userService.reset();
    assert.ok((await userService.getUser(`name`)) === undefined);
  });

  it(`test cache decorator`, async () => {
    const app = await createLightApp(path.join(__dirname, './fixtures/cache-decorator'));
    const appCtx = app.getApplicationContext();

    const userService: any = await appCtx.getAsync('userService');
    // cache with auto generate cache key
    expect((await userService.getDefaultUser('harry'))).toEqual('hello harry');
    expect((await userService.getDefaultUser('harry1'))).toEqual('hello harry');
    expect((await userService.getDefaultUser('harry2'))).toEqual('hello harry');

    // cache with auto generate cache key and ttl
    await sleep(20);
    expect((await userService.getDefaultUserWithTTL('harry'))).toEqual('hello ttl harry');
    expect((await userService.getDefaultUserWithTTL('harry1'))).toEqual('hello ttl harry');
    await sleep(105);
    expect((await userService.getDefaultUserWithTTL('harry2'))).toEqual('hello ttl harry2');

    // custom cache key
    expect((await userService.getUser('harry'))).toEqual('harry');
    expect((await userService.getUser('harry1'))).toEqual('harry');
    expect((await userService.getUser('harry2'))).toEqual('harry');

    await sleep(20);
    expect((await userService.getUser('harry3'))).toEqual('harry3');

    // throw error
    let err;
    try {
      await userService.getUserThrowError('harry1');
    } catch (e) {
      err = e;
    }
    expect(err.message).toEqual('error');
    // cache
    expect((await userService.getUserThrowError('harry'))).toEqual('harry');
    expect((await userService.getUserThrowError('harry1'))).toEqual('harry');

    // custom cache logic
    expect((await userService.getCustomUser('harry'))).toEqual('hello harry');
    expect((await userService.getCustomUser('mike'))).toEqual('hello harry');

    expect((await userService.getCustomUser('bbb'))).toEqual('hello bbb');

    await close(app);
  });
})
