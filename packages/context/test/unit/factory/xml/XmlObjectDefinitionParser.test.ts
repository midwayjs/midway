import * as path from 'path';
import { expect } from 'chai';
import { XmlObjectDefinitionParser } from '../../../../src/factory/xml/XmlObjectDefinitionParser';
import { ObjectDefinitionRegistry } from '../../../../src/factory/ApplicationContext';
import { Resource } from '../../../../src/base/Resource';
import { MixinDefinitionParser } from './MixinDefinitionParser';

const baseDir = path.resolve(__dirname, '../../../fixtures/app');
let parser: XmlObjectDefinitionParser;
let registry: ObjectDefinitionRegistry;

describe('/test/unit/factory/xml/XmlObjectDefinitionParser', () => {
  before(() => {
    registry = new ObjectDefinitionRegistry();
    parser = new XmlObjectDefinitionParser(baseDir, registry);
  });

  it('load fixture app should ok', async () => {
    const res = new Resource(baseDir, 'resources/context.xml');
    await parser.load(res);
    expect(parser.registry.hasDefinition('ctor:obj1')).true;
    const definition = parser.registry.getDefinition('ctor:obj1');
    expect(definition).not.null;
    expect(definition.constructorArgs.length).eq(3);
    expect(definition.constructorArgs[0].type).eq('json');
    expect(parser.registry.hasDefinition('list:obj1')).true;
    expect(parser.registry.hasDefinition('obj:foo')).true;
  });

  it('should register mixin parser ok', async () => {
    const res = new Resource(baseDir, 'resources/mixin.xml');
    const mixin = new MixinDefinitionParser();
    parser.registerParser(mixin);
    await parser.load(res);

    const definition = registry.getDefinition('mixin1');
    expect(definition).not.null;
    expect(definition.properties.size).greaterThan(0);
    expect(definition.properties.getProperty('def')).not.null;
    const obj = registry.getDefinition('obj:foo2');
    expect(obj).not.null;
    expect(obj.getAttr('mixin')).eq('mixin1,mixin2');

    parser.removeParser(mixin);
    expect(parser.hasParser(mixin.name)).false;
  });
});
