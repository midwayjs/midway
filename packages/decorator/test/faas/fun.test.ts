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

@Func('index.handler', {middleware: ['hello']})
class TestFun {
}

class TestFun1 {
  @Func('ttt.handler')
  @ServerlessTrigger(ServerlessTriggerType.HTTP, {method: 'get', path: '/'})
  @ServerlessTrigger(ServerlessTriggerType.API_GATEWAY, {method: 'get', path: '/'})
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
    expect(JSON.stringify(c)).toEqual(JSON.stringify([{
      'type': 'timer',
      'methodName': 'invoke',
      'metadata': {'type': 'every', 'value': '5m'}
    }, {
      'type': 'os',
      'methodName': 'invoke',
      'metadata': {'bucket': '', 'events': '', 'filter': {'prefix': '', 'suffix': ''}}
    }, {
      'type': 'mq',
      'methodName': 'invoke',
      'metadata': {'topic': '', 'tags': '', 'region': '', 'strategy': 'BACKOFF_RETRY'}
    }, {'type': 'log', 'methodName': 'invoke', 'metadata': {'source': '', 'project': '', 'log': ''}}, {
      'type': 'cdn',
      'methodName': 'invoke',
      'metadata': {}
    }, {'type': 'event', 'methodName': 'invoke', 'metadata': {}}, {
      'type': 'hsf',
      'methodName': 'invoke',
      'metadata': {}
    }, {'type': 'mtop', 'methodName': 'invoke', 'metadata': {}}, {
      'type': 'api_gateway',
      'methodName': 'invoke',
      'metadata': {'method': 'get', 'path': '/'}
    }, {
      'type': 'http',
      'methodName': 'invoke',
      'metadata': {'method': 'get', 'path': '/'}
    }, {
      'funHandler': 'ttt.handler',
      'key': 'invoke',
      'descriptor': {'writable': true, 'enumerable': false, 'configurable': true}
    }]));

    const def = getObjectDefProps(TestFun);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(FUNC_KEY);
    expect(m.length).toEqual(2);
  });
});
