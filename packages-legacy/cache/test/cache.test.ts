import * as path from 'path';
import * as assert from 'assert';
import { createLightApp } from '@midwayjs/mock';

describe(`test.cache`, ()=>{
  it(`test cache`, async ()=>{
    const app = await createLightApp(path.join(__dirname, './fixtures/cache-manager'));
    const appCtx = app.getApplicationContext();

    const userService: any = await appCtx.getAsync('userService');
    assert((await userService.getUser(`name`)) === undefined)
    await userService.setUser('name', 'stone-jin')
    assert((await userService.getUser(`name`)) === 'stone-jin')
    await userService.setUser('name', {name: '123'});
    assert(JSON.stringify(await userService.getUser('name'))===JSON.stringify({name: '123'}))
    await userService.reset();
    assert((await userService.getUser(`name`)) === undefined)
  })
})
