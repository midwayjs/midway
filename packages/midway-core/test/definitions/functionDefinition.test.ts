import { FunctionDefinition } from '../../src/definitions/functionDefinition';
import { BaseApplicationContext } from '../../src/context/applicationContext';
import { expect } from 'chai';
import { ScopeEnum, VALUE_TYPE } from '../../src';
import { ManagedValue } from '../../src/context/managed';
import sinon = require('sinon');

describe('/test/definitions/functionDefinition.test.ts', () => {
  it('function definition should be ok', async () => {
    const fun = new FunctionDefinition(new BaseApplicationContext());

    fun.setAttr('test', 1234);
    expect(fun.hasAttr('test')).false;
    expect(fun.getAttr('test')).undefined;
    expect(fun.hasConstructorArgs()).false;

    fun.autowire = true;
    expect(fun.isDirect()).false;
    expect(fun.isExternal()).false;

    expect(fun.isRequestScope()).false;
    expect(fun.isSingletonScope()).true;
    fun.scope = ScopeEnum.Request;
    expect(fun.isRequestScope()).true;
    expect(fun.isSingletonScope()).false;

    expect(await fun.creator.doConstructAsync(null)).is.null;

    const callback = sinon.spy();

    const clzz = function (a) {
      callback(a);
      return a;
    };

    expect(await fun.creator.doConstructAsync(clzz, [1])).eq(1);
    expect(callback.withArgs(1).calledOnce).true;

    expect(fun.creator.doConstruct(null)).is.null;
    const m = new ManagedValue();
    m.value = 123;
    m.valueType = VALUE_TYPE.NUMBER;
    expect(fun.creator.doConstruct(clzz, [m])).eq(123);
    expect(callback.withArgs(123).calledOnce).true;
  });
});
