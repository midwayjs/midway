
import { expect } from 'chai';
import { App, getClassMetadata, CLASS_KEY_CONSTRUCTOR, APPLICATION_KEY } from '../../src';

class Test {
  constructor(@App() aaa: any) {
    // ignore
  }

  @App()
  hhh: any;
}

describe('/test/framework/config.test.ts', () => {
  it('config decorator should be ok', () => {
    let data = getClassMetadata(CLASS_KEY_CONSTRUCTOR, Test);
    expect(data).deep.eq({
      0: {
        key: 'aaa',
        type: APPLICATION_KEY
      }
    });

    data = getClassMetadata(APPLICATION_KEY, Test);
    expect(data).deep.eq(
      [ {key: APPLICATION_KEY, propertyName: 'hhh'} ]
    );
  });
});
