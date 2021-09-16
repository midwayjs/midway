import { expect } from 'chai';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { ScopeEnum } from '@midwayjs/decorator';

describe('/test/definitions/objectDefinition.test.ts', () => {
  it('definition should be ok', () => {
    const definition = new ObjectDefinition();
    expect(definition.isAsync()).false;
    definition.asynchronous = true;
    expect(definition.isAsync()).true;

    definition.scope = ScopeEnum.Prototype;
    expect(definition.isRequestScope()).false;
    expect(definition.isSingletonScope()).false;

    definition.setAttr('hello', 1);
    expect(definition.getAttr('hello')).eq(1);
    expect(definition.hasAttr('hello')).true;

    expect(definition.hasConstructorArgs()).false;
  });
});
