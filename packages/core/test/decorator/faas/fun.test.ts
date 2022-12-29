import {
  FUNC_KEY,
  Provide,
  getClassMetadata,
  listModule,
  ServerlessFunction,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '../../../src';

@Provide()
class TestFun1 {
  @ServerlessFunction({
    functionName: 'abcde'
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, { method: 'get', path: '/' })
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, { method: 'get', path: '/' })
  @ServerlessTrigger(ServerlessTriggerType.MTOP)
  @ServerlessTrigger(ServerlessTriggerType.SSR)
  @ServerlessTrigger(ServerlessTriggerType.HSF)
  @ServerlessTrigger(ServerlessTriggerType.EVENT)
  @ServerlessTrigger(ServerlessTriggerType.CDN)
  @ServerlessTrigger(ServerlessTriggerType.LOG, {
    source: '',
    project: '',
    log: ''
  })
  @ServerlessTrigger(ServerlessTriggerType.MQ, {
    topic: '',
    tags: '',
    region: '',
    strategy: 'BACKOFF_RETRY'
  })
  @ServerlessTrigger(ServerlessTriggerType.OS, {
    bucket: '',
    events: '',
    filter: {
      prefix: '',
      suffix: ''
    }
  })
  @ServerlessTrigger(ServerlessTriggerType.TIMER, {
    type: 'every',
    value: '5m',
  })
  invoke() {
  }
}

describe('/test/faas/fun.test.ts', () => {
  it('fun decorator should be ok', () => {
    const c = getClassMetadata(FUNC_KEY, TestFun1);
    expect(c).toMatchSnapshot();

    const m = listModule(FUNC_KEY);
    expect(m.length).toEqual(1);
  });
});
