
import { expect } from 'chai';
import { LifeCycle, getProviderId, listModule, LIFECYCLE_KEY, getClassMetadata } from '../../src';

@LifeCycle('hello')
class Test {}

describe('/test/annotation/lifecycle.test.ts', () => {
  it('lifecycle decorator should be ok', () => {
    const id = getProviderId(Test);
    expect(id).eq('hello');

    const ms = listModule(LIFECYCLE_KEY);
    expect(ms.length).eq(1);

    const meta = getClassMetadata(LIFECYCLE_KEY, Test);
    expect(meta).deep.eq({});
  });
});
