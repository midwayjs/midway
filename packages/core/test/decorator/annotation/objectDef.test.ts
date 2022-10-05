import { Destroy, getObjectDefinition, Init, Scope, ScopeEnum } from '../../../src';

class Parent {}

@Scope(ScopeEnum.Prototype)
class Test extends Parent {
  @Init()
  async abcde() {}

  @Destroy()
  destroy() {}
}

@Scope(ScopeEnum.Singleton)
class TestOne {}

@Scope(ScopeEnum.Request, { allowDowngrade: true})
class TestOne1 {}

describe('/test/annotation/objectDef.test.ts', () => {
  it('objectDef decorator should be ok', () => {
    const def = getObjectDefinition(Test);
    expect(def).toStrictEqual({
      scope: ScopeEnum.Prototype,
      initMethod: 'abcde',
      destroyMethod: 'destroy',
    });

    const defone = getObjectDefinition(TestOne);
    expect(defone).toStrictEqual({
      scope: ScopeEnum.Singleton,
    });

    const def1 = getObjectDefinition(TestOne1);
    expect(def1).toStrictEqual({
      scope: ScopeEnum.Request,
      allowDowngrade: true,
    });
  });
});
