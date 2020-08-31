
import { expect } from 'chai';
import { Logger, getClassMetadata, CLASS_KEY_CONSTRUCTOR, LOGGER_KEY } from '../../src';

class Test {
  constructor(@Logger('aaa') aaa: any) {
    // ignore
  }

  @Logger()
  logger: any;

  @Logger('bbb')
  bbb: any;
}

describe('/test/framework/logger.test.ts', () => {
  it('logger decorator should be ok', () => {
    let data = getClassMetadata(CLASS_KEY_CONSTRUCTOR, Test);
    expect(data).deep.eq({
      0: {
        key: 'aaa',
        type: LOGGER_KEY
      }
    });

    data = getClassMetadata(LOGGER_KEY, Test);
    expect(data).deep.eq(
      [ {key: 'logger', propertyName: 'logger'}, {key: 'bbb', propertyName: 'bbb'},  ]
    );
  });
});
