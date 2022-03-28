import { createLightFramework } from '../util';
import * as path from 'path';
import { MidwayMockService, IMidwayApplication } from '../../src';
import { UserService } from '../fixtures/base-app-ctx-mock/src/configuration';

describe('/service/mockService.test.ts', () => {

  it('should test mock context', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-ctx-mock/src'
    ));

    const app = framework.getApplication() as IMidwayApplication;
    const mockService = framework.getApplicationContext().get(MidwayMockService);
    mockService.mockContext(app, 'user', 'zhangting');

    let data = 'abc';
    mockService.mockContext(app, 'abc', {
      get: ()  => {
        return data;
      },
      set: (ddd) => {
        data = ddd + 'c';
      }
    });

    const ctx = app.createAnonymousContext();
    const fn = await framework.applyMiddleware();
    await fn(ctx);

    expect(ctx['user']).toEqual('zhangting');
    expect(ctx['abc']).toEqual('abc');
    ctx['abc'] = 'abc';
    expect(ctx['abc']).toEqual('abcc');

    framework.getApplicationContext().bindClass(UserService);

    mockService.mockClassProperty(UserService, 'invoke', () => {
      return '1112';
    });

    const userService = await framework.getApplicationContext().getAsync(UserService);
    expect(userService.invoke()).toEqual('1112');

    mockService.restore();

    expect(mockService.getContextMocksSize()).toEqual(0);
    expect(mockService.getMocksSize()).toEqual(0);

    expect(await userService.invoke()).toEqual('hello world');

    mockService.mockProperty(userService, 'invoke',  async () => {
      return 'abc'
    });

    expect(await userService.invoke()).toEqual('abc');

    mockService.restore();

    expect(await userService.invoke()).toEqual('hello world');

    await framework.stop();
  });
});
