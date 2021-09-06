import {
  Func,
  FUNC_KEY,
  getClassMetadata,
  getObjectDefProps,
  listModule,
  ScopeEnum,
  ServerlessFunction,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '../../src';

@Func('index.handler', { middleware: ['hello'] })
class TestFun {
}

class TestFun1 {
  @Func('ttt.handler')
  @ServerlessFunction({
    functionName: 'abcde'
  })
  @ServerlessTrigger(ServerlessTriggerType.HTTP, { method: 'get', path: '/' })
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, { method: 'get', path: '/' })
  @ServerlessTrigger(ServerlessTriggerType.MTOP)
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
    const meta = getClassMetadata(FUNC_KEY, TestFun);
    expect(meta).toStrictEqual([
      {
        funHandler: 'index.handler',
        middleware: ['hello'],
      },
    ]);

    const c = getClassMetadata(FUNC_KEY, TestFun1);
    expect(c).toMatchSnapshot();

    const def = getObjectDefProps(TestFun);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(FUNC_KEY);
    expect(m.length).toEqual(2);
  });
});
