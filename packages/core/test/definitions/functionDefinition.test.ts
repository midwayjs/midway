import { FunctionDefinition } from '../../src/definitions/functionDefinition';
import { expect } from 'chai';
import { ScopeEnum } from '@midwayjs/decorator';
import sinon = require('sinon');

describe('/test/definitions/functionDefinition.test.ts', () => {
  it('function definition should be ok', async () => {
    const fun = new FunctionDefinition();

    fun.setAttr('test', 1234);
    expect(fun.hasAttr('test')).false;
    expect(fun.getAttr('test')).undefined;
    expect(fun.hasConstructorArgs()).false;

    expect(fun.isDirect()).false;
    expect(fun.isExternal()).false;

    expect(fun.isRequestScope()).false;
    expect(fun.isSingletonScope()).true;
    fun.scope = ScopeEnum.Request;
    expect(fun.isRequestScope()).true;
    expect(fun.isSingletonScope()).false;

    expect(await fun.creator.doConstructAsync(null)).is.null;

    const callback = sinon.spy();

    const clzz = function (a, args) {
      callback(args[0]);
      return args[0];
    };

    expect(await fun.creator.doConstructAsync(clzz, [1])).eq(1);
    expect(callback.withArgs(1).calledOnce).true;

    expect(fun.creator.doConstruct(null)).is.null;

    expect(fun.creator.doConstruct(clzz, [123])).eq(123);
    expect(callback.withArgs(123).calledOnce).true;

    let count = 0;
    const clzzNoArgs = (a) => {
      count++;
      callback('noArgs' + count);
      return 'noArgs' + count;
    };

    expect(fun.creator.doConstruct(clzzNoArgs)).eq('noArgs1');
    expect(callback.withArgs('noArgs1').calledOnce).true;
    expect(count).eq(1);

    expect(await fun.creator.doConstructAsync(clzzNoArgs)).eq('noArgs2');
    expect(callback.withArgs('noArgs2').calledOnce).true;
  });
});
