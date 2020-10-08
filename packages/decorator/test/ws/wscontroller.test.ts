import { getClassMetadata, getObjectDefProps, listModule, ScopeEnum, WS_CONTROLLER_KEY, WSController } from '../../src';

@WSController('bbb')
class TestFun {
}

describe('/test/ws/wscontroller.test.ts', function () {
  it('test ws controller decorator', () => {
    const meta = getClassMetadata(WS_CONTROLLER_KEY, TestFun);
    expect(meta['namespace']).toEqual('bbb')

    const def = getObjectDefProps(TestFun);
    expect(def).toEqual({
      scope: ScopeEnum.Request,
    });

    const m = listModule(WS_CONTROLLER_KEY);
    expect(m.length).toEqual(1);
  });
});
