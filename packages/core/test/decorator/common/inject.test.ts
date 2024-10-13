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
      injectMode: 'SelfName',
      value: 'aa',
      targetKey: 'aa'
    });
    expect(meta['ee']['targetKey']).toEqual('ee');
    expect(meta['ee']['value'].length).toEqual(32);
    expect(meta['ff']).toEqual({
      injectMode: 'SelfName',
      value: 'ff',
      targetKey: 'ff'
    });
  });
});
