import { FunctionDefinition } from '../../src/definitions/functionDefinition';
import { ScopeEnum } from '@midwayjs/decorator';
import sinon = require('sinon');

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

    expect(await fun.creator.doConstructAsync(null)).toBeNull();

    const callback = sinon.spy();

    const clzz = function (a, args) {
      callback(args[0]);
      return args[0];
    };

    expect(await fun.creator.doConstructAsync(clzz, [1])).toEqual(1);
    expect(callback.withArgs(1).calledOnce).toBeTruthy();

    expect(fun.creator.doConstruct(null)).toBeNull();

    expect(fun.creator.doConstruct(clzz, [123])).toEqual(123);
    expect(callback.withArgs(123).calledOnce).toBeTruthy();

    let count = 0;
    const clzzNoArgs = (a) => {
      count++;
      callback('noArgs' + count);
      return 'noArgs' + count;
    };

    expect(fun.creator.doConstruct(clzzNoArgs)).toEqual('noArgs1');
    expect(callback.withArgs('noArgs1').calledOnce).toBeTruthy();
    expect(count).toEqual(1);

    expect(await fun.creator.doConstructAsync(clzzNoArgs)).toEqual('noArgs2');
    expect(callback.withArgs('noArgs2').calledOnce).toBeTruthy();
  });
});
