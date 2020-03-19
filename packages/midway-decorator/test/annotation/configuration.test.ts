
import { expect } from 'chai';
import { Configuration, getClassMetadata, CONFIGURATION_KEY } from '../../src';

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
  });
});
