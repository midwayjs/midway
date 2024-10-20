import { FunctionDefinition } from '../../src/definitions/functionDefinition';
import { ScopeEnum, IMidwayContainer } from '../../src';
import * as sinon from 'sinon';

describe('/test/definitions/functionDefinition.test.ts', () => {
  it('function definition should be ok', async () => {
    const fun = new FunctionDefinition();

    fun.setAttr('test', 1234);
    expect(fun.hasAttr('test')).toBeFalsy();
    expect(fun.getAttr('test')).toBeUndefined();
    expect(fun.hasConstructorArgs()).toBeFalsy();

    expect(fun.isDirect()).toBeFalsy();
    expect(fun.isExternal()).toBeFalsy();

    expect(fun.isRequestScope()).toBeFalsy();
    expect(fun.isSingletonScope()).toBeTruthy();
    fun.scope = ScopeEnum.Request;
    expect(fun.isRequestScope()).toBeTruthy();
    expect(fun.isSingletonScope()).toBeFalsy();

    expect(await fun.creator.doConstruct(null)).toBeNull();

    const callback = sinon.spy();

    const clzz = function (context, args) {
      callback(args?.[0]);
      return args?.[0];
    };

    expect(await fun.creator.doConstruct(clzz, [1])).toBe(clzz);
    expect(callback.called).toBeFalsy();

    expect(fun.creator.doConstruct(null)).toBeNull();

    expect(fun.creator.doConstruct(clzz, [123])).toBe(clzz);
    expect(callback.called).toBeFalsy();

    let count = 0;
    const clzzNoArgs = (context) => {
      count++;
      callback('noArgs' + count);
      return 'noArgs' + count;
    };

    expect(fun.creator.doConstruct(clzzNoArgs)).toBe(clzzNoArgs);
    expect(callback.called).toBeFalsy();
    expect(count).toEqual(0);

    expect(await fun.creator.doConstruct(clzzNoArgs)).toBe(clzzNoArgs);
    expect(callback.called).toBeFalsy();
    expect(count).toEqual(0);

    // Test doInit and doInitAsync
    const mockContext: IMidwayContainer = {
      get: () => ({}),
    } as any;

    expect(await fun.creator.doInit(clzz, mockContext)).toBe(undefined);
    expect(callback.calledWith(undefined)).toBeTruthy();

    expect(await fun.creator.doInitAsync(clzzNoArgs, mockContext)).toBe('noArgs1');
    expect(callback.calledWith('noArgs1')).toBeTruthy();
    expect(count).toEqual(1);
  });
});
