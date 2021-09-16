import {
  Scope,
  ScopeEnum,
  Init,
  Destroy,
  getObjectDefinition,
} from '../../src';

@Scope(ScopeEnum.Prototype)
class Test {
  @Init()
  init() {}

  @Destroy()
  destroy() {}
}

@Scope()
class TestOne {}

describe('/test/annotation/objectDef.test.ts', () => {
  it('objectDef decorator should be ok', () => {
    const def = getObjectDefinition(Test);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Prototype,
      initMethod: 'init',
      destroyMethod: 'destroy',
    });

    const defone = getObjectDefinition(TestOne);
    expect(defone).toStrictEqual({
      scope: ScopeEnum.Singleton,
    });
  });
});
