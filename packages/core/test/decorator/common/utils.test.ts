import {
  saveProviderId,
  getPropertyInject,
  Provide,
  Inject,
  savePropertyInject,
  saveObjectDefinition,
  getObjectDefinition,
  getProviderId,
} from '../../../src';

@Provide()
class Test {
  @Inject('@testpackage')
  hello: any;
}

class TestOne {
  constructor(h1: any, h2: any) {
    // ignore
  }
}

describe('/test/common/util.test.ts', () => {
  it('util saveProviderId should be ok', () => {
    saveProviderId('test1', Test);
    expect(getProviderId(Test)).toEqual('test1');

    saveProviderId('test2', Test);
    expect(getProviderId(Test)).toEqual('test2');
  });

  it('util savePropertyInject should be ok', () => {
    let p = getPropertyInject(Test);
    expect(p['hello']).toEqual({
      'id': '@testpackage',
      'injectMode': 'Identifier',
      'name': 'hello',
      'targetKey': 'hello'
    });

    savePropertyInject({
      identifier: '@testpackage1',
      target: Test,
      targetKey: 'hello',
    });
    savePropertyInject({
      identifier: '@testpackage2',
      target: Test,
      targetKey: 'hello',
    });
    p = getPropertyInject(Test, false);
    expect(p['hello']).toEqual({
      injectMode: 'Identifier',
      targetKey: 'hello',
      id: '@testpackage2',
      name: 'hello',
    });
  });

  it('util saveObjectDefProps should be ok', () => {
    saveObjectDefinition(TestOne);
    const tt = getObjectDefinition(TestOne);
    expect(tt).toStrictEqual({});
  });
});
