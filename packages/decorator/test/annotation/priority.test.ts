import { Priority, getClassMetadata, PRIORITY_KEY } from '../../src';

@Priority(10)
class Test {}

describe('/test/annotation/priority.test.ts', () => {
  it('priority decorator should be ok', () => {
    const meta = getClassMetadata(PRIORITY_KEY, Test);
    expect(meta).toEqual(10);
  });
});
