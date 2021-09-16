import {
  App,
  getClassMetadata,
  APPLICATION_KEY,
} from '../../src';

class Test {
  @App()
  hhh: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(APPLICATION_KEY, Test);
    expect(data).toStrictEqual([{key: APPLICATION_KEY, meta: {type: undefined}, propertyName: 'hhh'}]);
  });
});
