
import { expect } from 'chai';
import { Provide, getProviderId, isProvide } from '../../src';

@Provide('jjj')
class Test {}

describe('/test/annotation/provide.test.ts', () => {
  it('provide decorator should be ok', () => {
    const id = getProviderId(Test);
    expect(id).eq('jjj');

    expect(isProvide(Test)).true;
  });
});
