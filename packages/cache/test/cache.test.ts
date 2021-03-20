
import { LightFramework } from '@midwayjs/core';
import * as path from 'path';
import * as assert from 'assert';

describe(`test.cache`, ()=>{
  it(`test cache`, async ()=>{
    const framework = new LightFramework();
    await framework.initialize({
      baseDir: path.join(__dirname, './fixtures/cache-manager/src'),
      isTsMode: true,
    });

    const appCtx = framework.getApplicationContext();

    const userService: any = await appCtx.getAsync('userService');
    assert((await userService.getUser(`name`)) === undefined)
    await userService.setUser('name', 'stone-jin')
    assert((await userService.getUser(`name`)) === 'stone-jin')
    await userService.reset();
    assert((await userService.getUser(`name`)) === undefined)
  })
})
