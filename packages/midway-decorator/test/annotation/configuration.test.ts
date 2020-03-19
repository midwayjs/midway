
import { expect } from 'chai';
import { Configuration, getClassMetadata, CONFIGURATION_KEY, getProviderId, LIFECYCLE_IDENTIFIER_PREFIX, listModule } from '../../src';

@Configuration({
  importConfigs: ['./config.default'],
  importObjects: {aa: {bb: 1}},
  imports: ['./nodes'],
  namespace: 'hello'
})
class Test {}

describe('/test/annotation/configuration.test.ts', () => {
  it('configuration decorator should be ok', () => {
    const meta = getClassMetadata(CONFIGURATION_KEY, Test);
    expect(meta).deep.eq({
      importConfigs: ['./config.default'],
      importObjects: {aa: {bb: 1}},
      imports: ['./nodes'],
      namespace: 'hello'
    });

    const id = getProviderId(Test);
    expect(id).eq(LIFECYCLE_IDENTIFIER_PREFIX + 'test');

    const ms = listModule(CONFIGURATION_KEY);
    expect(ms.length).eq(1);
  });
});
