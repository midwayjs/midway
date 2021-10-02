import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { ScopeEnum } from '@midwayjs/decorator';

describe('/test/definitions/objectDefinition.test.ts', () => {
  it('definition should be ok', () => {
    const definition = new ObjectDefinition();
    expect(definition.isAsync()).toBeFalsy();
    definition.asynchronous = true;
    expect(definition.isAsync()).toBeTruthy();

    definition.scope = ScopeEnum.Prototype;
    expect(definition.isRequestScope()).toBeFalsy();
    expect(definition.isSingletonScope()).toBeFalsy();

    definition.setAttr('hello', 1);
    expect(definition.getAttr('hello')).toEqual(1);
    expect(definition.hasAttr('hello')).toBeTruthy();

    expect(definition.hasConstructorArgs()).toBeFalsy();
  });
});
