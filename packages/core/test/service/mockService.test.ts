import { createLightFramework } from '../util';
import * as path from 'path';
import { MidwayMockService, IMidwayApplication } from '../../src';
import { UserService } from '../fixtures/base-app-ctx-mock/src/configuration';

describe('/service/mockService.test.ts', () => {
  let framework;
  let app: IMidwayApplication;
  let mockService: MidwayMockService;

  beforeAll(async () => {
    framework = await createLightFramework(path.join(
      __dirname,
      './fixtures/base-app-ctx-mock/src'
    ));
    app = framework.getApplication() as IMidwayApplication;
    mockService = framework.getApplicationContext().get(MidwayMockService);
  });

  afterAll(async () => {
    await framework.stop();
  });

  it('should test mock context', async () => {
    mockService.mockContext(app, 'user', 'zhangting');
    mockService.mockContext(app, (ctx) => {
      ctx['bbbb'] = 'cccc';
    });

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
    expect(ctx['bbbb']).toEqual('cccc');
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

    expect(await userService.invoke()).toEqual('hello world');

    mockService.mockProperty(userService, 'invoke',  async () => {
      return 'abc'
    });

    expect(await userService.invoke()).toEqual('abc');

    mockService.restore();

    expect(await userService.invoke()).toEqual('hello world');
  });

  it('should test mock with groups', async () => {
    // 测试不同分组的 mock
    mockService.mockContext(app, 'user', 'zhangting', 'group1');
    mockService.mockContext(app, 'role', 'admin', 'group2');

    let ctx = app.createAnonymousContext();
    const fn = await framework.applyMiddleware();
    await fn((ctx));

    expect(ctx['user']).toEqual('zhangting');
    expect(ctx['role']).toEqual('admin');

    // 测试恢复单个分组
    mockService.restore('group1');

    ctx = app.createAnonymousContext();
    await (await framework.applyMiddleware())(ctx);

    expect(ctx['user']).toBeUndefined();
    expect(ctx['role']).toEqual('admin');

    // 测试恢复所有分组
    mockService.restoreAll();

    ctx = app.createAnonymousContext();
    await (await framework.applyMiddleware())(ctx);

    expect(ctx['user']).toBeUndefined();
    expect(ctx['role']).toBeUndefined();
  });

  it('should test mock class property with groups', async () => {
    framework.getApplicationContext().bindClass(UserService);
    mockService.mockClassProperty(UserService, 'invoke', () => '1112', 'group1');
    mockService.mockClassProperty(UserService, 'getName', () => 'mockName', 'group2');

    expect(mockService.isMocked(UserService, 'invoke', 'group1')).toBeTruthy();

    const userService = await framework.getApplicationContext().getAsync(UserService);
    expect(userService.invoke()).toEqual('1112');
    expect(userService.getName()).toEqual('mockName');

    // 恢复单个分组
    mockService.restore('group1');

    expect(await userService.invoke()).toEqual('hello world');
    expect(userService.getName()).toEqual('mockName');

    // 恢复所有分组
    mockService.restoreAll();

    expect(mockService.isMocked(UserService, 'invoke', 'group1')).toBeFalsy();
    expect(await userService.invoke()).toEqual('hello world');
    expect(() => {
      userService.getName();
    }).toThrow('userService.getName is not a function');
  });

  it('should test mock property with groups', async () => {
    const obj = {
      method1: () => 'original1',
      method2: () => 'original2'
    };

    mockService.mockProperty(obj, 'method1', () => 'mocked1', 'group1');
    mockService.mockProperty(obj, 'method2', () => 'mocked2', 'group2');

    expect(obj.method1()).toEqual('mocked1');
    expect(obj.method2()).toEqual('mocked2');

    // 恢复单个分组
    mockService.restore('group1');

    expect(obj.method1()).toEqual('original1');
    expect(obj.method2()).toEqual('mocked2');

    // 恢复所有分组
    mockService.restoreAll();

    expect(obj.method1()).toEqual('original1');
    expect(obj.method2()).toEqual('original2');
  });

  it('should test isMocked with groups', async () => {
    const obj = { method: () => 'original' };

    mockService.mockProperty(obj, 'method', () => 'mocked', 'testGroup');

    expect(mockService.isMocked(obj, 'method', 'testGroup')).toBeTruthy();

    mockService.restore('testGroup');

    expect(mockService.isMocked(obj, 'method', 'testGroup')).toBeFalsy();
  });

  it('should test mock without specifying group', async () => {
    const obj = { method: () => 'original' };

    // 不传 group，使用默认分组
    mockService.mockProperty(obj, 'method', () => 'mocked');

    expect(mockService.isMocked(obj, 'method')).toBeTruthy();
    expect(obj.method()).toEqual('mocked');

    // 恢复默认分组
    mockService.restore();

    expect(mockService.isMocked(obj, 'method')).toBeFalsy();
    expect(obj.method()).toEqual('original');
  });
});
