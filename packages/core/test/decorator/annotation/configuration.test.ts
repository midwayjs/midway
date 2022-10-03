import { Configuration, getClassMetadata, CONFIGURATION_KEY } from '../../../src';

@Configuration({
  importConfigs: ['./config.default'],
  importObjects: { aa: { bb: 1 } },
  imports: ['./nodes'],
  namespace: 'hello',
  detectorOptions: {
    a: 1
  }
})
class Test {}

@Configuration()
class TestOne {}

describe('/test/annotation/configuration.test.ts', () => {
  it('configuration decorator should be ok', () => {
    const meta = getClassMetadata(CONFIGURATION_KEY, Test);
    expect(meta).toStrictEqual({
      importConfigs: ['./config.default'],
      importObjects: { aa: { bb: 1 } },
      imports: ['./nodes'],
      namespace: 'hello',
      detectorOptions: {
        a: 1
      },
    });

    const metaone = getClassMetadata(CONFIGURATION_KEY, TestOne);
    expect(metaone).toStrictEqual({});
  });
});
