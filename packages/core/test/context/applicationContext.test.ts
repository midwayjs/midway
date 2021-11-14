import { ObjectDefinitionRegistry } from '../../src/context/definitionRegistry';
import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { MidwayContainer } from '../../src';

describe('/test/context/applicationContext.test.ts', () => {
  describe('ObjectDefinitionRegistry', () => {
    it('should be ok', () => {
      const definition = new ObjectDefinition();
      definition.id = 'hello2';
      definition.name = 'helloworld1';

      const registry = new ObjectDefinitionRegistry();
      registry.registerDefinition(definition.id, definition);

      const definition1 = new ObjectDefinition();
      definition1.id = 'hello1';
      definition1.path = '/test/hello1';
      registry.registerDefinition(definition1.id, definition1);

      let ids = registry.getSingletonDefinitionIds();
      expect(Array.isArray(ids)).toBeTruthy();
      expect(ids[0]).toEqual('hello2');

      const defs = registry.getDefinitionByName('helloworld1');
      expect(Array.isArray(defs)).toBeTruthy();
      expect(defs.length).toEqual(1);
      expect(defs[0].name).toEqual('helloworld1');

      expect(registry.hasDefinition(definition.id)).toBeTruthy();
      expect(registry.getDefinition(definition.id)).toBeDefined()
      expect(registry.identifiers).toStrictEqual([definition.id, definition1.id]);
      expect(registry.count).toEqual(2);

      registry.clearAll();
      expect(registry.count).toEqual(0);
      ids = registry.getSingletonDefinitionIds();
      expect(ids).toStrictEqual([]);

      expect(registry.getDefinition(definition.id)).toBeUndefined();

      registry.registerDefinition(definition1.id, definition1);
      expect(registry.hasDefinition(definition1.id)).toBeTruthy();
      registry.removeDefinition(definition1.id);
      expect(registry.hasDefinition(definition1.id)).toBeFalsy();

      const obj = {
        aa: 1,
        bb: [22, 'asdfa']
      };
      registry.registerObject('he1', obj);
      expect(registry.hasObject('he1')).toBeTruthy();
      expect(registry.getObject('he1')).toStrictEqual({
        aa: 1,
        bb: [22, 'asdfa']
      });

      expect(registry.identifiers).toStrictEqual([]);
    });
  });
  describe('BaseApplicationContext', () => {
    it('context get/getAsync should be ok', async () => {
      const definition = new ObjectDefinition();
      definition.id = 'hello2';
      definition.name = 'helloworld1';
      definition.path = class HelloWorld {
        aa = 123;
      };

      definition.asynchronous = true;

      const definition1 = new ObjectDefinition();
      definition1.id = 'hello1';
      definition1.name = 'helloworld';
      definition1.path = class HelloWorldA {
        aa = 1231;
      };

      const app = new MidwayContainer();
      app.registry.registerDefinition(definition.id, definition);
      app.registry.registerDefinition(definition1.id, definition1);

      await app.ready();

      const subApp = new MidwayContainer(app);
      const d: any = await subApp.getAsync('hello2');
      expect(d).toBeDefined()
      expect(d.aa).toEqual(123);

      const b: any = subApp.get('hello1');
      expect(b).toBeDefined()
      expect(b.aa).toEqual(1231);

      await app.stop();
      expect(app.registry.identifiers.length).toEqual(0);
    });
  });
});
