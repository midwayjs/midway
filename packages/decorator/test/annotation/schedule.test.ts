import {
  Schedule,
  getObjectDefinition,
  ScopeEnum,
  listModule,
  SCHEDULE_KEY,
  getClassMetadata,
} from '../../src';

@Schedule({
  type: 'worker',
  interval: 2333,
})
class Test {}

describe('/test/annotation/schedule.test.ts', () => {
  it('schedule decorator should be ok', () => {
    const def = getObjectDefinition(Test);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const ms = listModule(SCHEDULE_KEY);
    expect(ms.length).toEqual(1);

    const meta = getClassMetadata(SCHEDULE_KEY, Test);
    expect(meta).toStrictEqual({
      type: 'worker',
      interval: 2333,
    });
  });
});
