import {expect} from 'chai';
import {ObjectDefinition} from '../../../src/base/ObjectDefinition';
import { ScopeEnum } from '../../../src/base/Scope';

describe('/test/unit/base/ObjectDefinition', () => {
  it('definition should be ok', () => {
    const definition = new ObjectDefinition();
    expect(definition.isAsync()).false;
    definition.asynchronous = true;
    expect(definition.isAsync()).true;
    expect(definition.isAutowire()).false;
    definition.autowire = true;
    expect(definition.isAutowire()).true;

    definition.scope = ScopeEnum.Prototype;
    expect(definition.isRequestScope()).false;
    expect(definition.isSingletonScope()).false;

    expect(definition.isExternal()).false;
    definition.external = true;
    expect(definition.isExternal()).true;

    expect(definition.isDirect()).false;
    definition.direct = true;
    expect(definition.isDirect()).true;

    definition.setAttr('hello', 1);
    expect(definition.getAttr('hello')).eq(1);
    expect(definition.hasAttr('hello')).true;
  });
});
