
import { expect } from 'chai';
import { Schedule, getObjectDefProps, ScopeEnum, listModule, SCHEDULE_KEY, getClassMetadata } from '../../src';

@Schedule({
  type: 'worker',
  interval: 2333,
})
class Test {}

describe('/test/annotation/schedule.test.ts', () => {
  it('schedule decorator should be ok', () => {
    const def = getObjectDefProps(Test);
    expect(def).deep.eq({
      scope: ScopeEnum.Request,
    });

    const ms = listModule(SCHEDULE_KEY);
    expect(ms.length).eq(1);

    const meta = getClassMetadata(SCHEDULE_KEY, Test);
    expect(meta).deep.eq({
      type: 'worker',
      interval: 2333,
    });
  });
});
