import { Provide, Inject, getPropertyInject } from '../../../src';

@Provide()
class InjectChild {
}

class InjectChild2 {
}


class Test {
  @Inject()
  aa: any;

  @Inject()
  ee: InjectChild;

  @Inject()
  ff: InjectChild2;
}

describe('/test/annotation/inject.test.ts', () => {
  it('inject decorator should be ok', () => {
    let meta = getPropertyInject(Test);
    expect(meta['aa']).toEqual({
      id: 'aa',
      injectMode: 'SelfName',
      name: 'aa',
      targetKey: 'aa'
    });
    expect(meta['ee']['targetKey']).toEqual('ee');
    expect(meta['ee']['name']).toEqual('ee');
    expect(meta['ff']).toEqual({
      id: 'ff',
      injectMode: 'SelfName',
      name: 'ff',
      targetKey: 'ff'
    });
  });
});
