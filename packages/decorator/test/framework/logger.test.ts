import {
  Logger,
  getClassMetadata,
  LOGGER_KEY,
} from '../../src';

class Test {
  @Logger()
  logger: any;

  @Logger('bbb')
  bbb: any;
}

describe('/test/framework/logger.test.ts', () => {
  it('logger decorator should be ok', () => {
    let data = getClassMetadata(LOGGER_KEY, Test);
    expect(data).toStrictEqual([
      { key: 'logger', propertyName: 'logger' },
      { key: 'bbb', propertyName: 'bbb' },
    ]);
  });
});
