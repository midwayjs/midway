import {
  Func,
  FUNC_KEY,
  getClassMetadata,
  getObjectDefProps,
  listModule,
  ScopeEnum,
  ServerlessTrigger
} from '../../src';
import { ServerlessTriggerType } from '../../dist';

@Func('index.handler', { middleware: ['hello'] })
class TestFun {
}

class TestFun1 {
  @Func('ttt.handler')
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
    expect(JSON.stringify(c)).toEqual(JSON.stringify([{"type":"timer","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"type":"every","value":"5m","functionName":"testFun1-invoke"}},{"type":"os","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"bucket":"","events":"","filter":{"prefix":"","suffix":""},"functionName":"testFun1-invoke"}},{"type":"mq","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"topic":"","tags":"","region":"","strategy":"BACKOFF_RETRY","functionName":"testFun1-invoke"}},{"type":"log","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"source":"","project":"","log":"","functionName":"testFun1-invoke"}},{"type":"cdn","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"functionName":"testFun1-invoke"}},{"type":"event","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"functionName":"testFun1-invoke"}},{"type":"hsf","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"functionName":"testFun1-invoke"}},{"type":"mtop","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"functionName":"testFun1-invoke"}},{"type":"apigw","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"method":"get","path":"/","functionName":"testFun1-invoke"}},{"type":"http","methodName":"invoke","functionName":"testFun1-invoke","metadata":{"method":"get","path":"/","functionName":"testFun1-invoke"}},{"funHandler":"ttt.handler","key":"invoke","descriptor":{"writable":true,"enumerable":false,"configurable":true}}]));

    const def = getObjectDefProps(TestFun);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(FUNC_KEY);
    expect(m.length).toEqual(2);
  });
});
