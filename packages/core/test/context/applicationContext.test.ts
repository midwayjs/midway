import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { ObjectDefinitionRegistry, BaseApplicationContext } from '../../src/context/applicationContext';
import sinon = require('sinon');
import { expect } from 'chai';

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
      expect(ids).is.an('array');
      expect(ids[0]).eq('hello2');

      const defs = registry.getDefinitionByName('helloworld1');
      expect(defs).is.an('array');
      expect(defs.length).eq(1);
      expect(defs[0].name).eq('helloworld1');

      expect(registry.hasDefinition(definition.id)).true;
      expect(registry.getDefinition(definition.id)).not.null;
      expect(registry.identifiers).deep.eq([definition.id, definition1.id]);
      expect(registry.count).eq(2);
      expect(registry.getDefinitionByPath(definition1.path)).not.null;
      expect(registry.getDefinitionByPath('/test')).is.null;

      registry.clearAll();
      expect(registry.count).eq(0);
      ids = registry.getSingletonDefinitionIds();
      expect(ids).deep.eq([]);

      expect(registry.getDefinition(definition.id)).is.undefined;

      registry.registerDefinition(definition1.id, definition1);
      expect(registry.hasDefinition(definition1.id)).true;
      registry.removeDefinition(definition1.id);
      expect(registry.hasDefinition(definition1.id)).false;

      const obj = {
        aa: 1,
        bb: [22, 'asdfa']
      };
      registry.registerObject('he1', obj);
      expect(registry.hasObject('he1')).true;
      expect(registry.getObject('he1')).deep.eq({
        aa: 1,
        bb: [22, 'asdfa']
      });

      expect(registry.identifiers).deep.eq([]);
    });
  });
  describe('BaseApplicationContext', () => {
    it('context get/getAsync should be ok', async () => {
      const callback = sinon.spy();
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

      const app = new BaseApplicationContext(__dirname);
      app.registerDefinition(definition.id, definition);
      app.registerDefinition(definition1.id, definition1);

      expect(app.isReady).false;
      await app.ready();
      expect(app.isReady).true;

      try {
        app.get('hello2');
      } catch (e) {
        callback(e.message);
      }
      expect(callback.withArgs('hello2 must use getAsync').calledOnce).true;

      const subApp = new BaseApplicationContext(__dirname, app);
      try {
        subApp.get('hello2');
      } catch (e) {
        callback(e.message + 1);
      }
      expect(callback.withArgs('hello2 must use getAsync1').calledOnce).true;

      const d: any = await subApp.getAsync('hello2');
      expect(d).not.null;
      expect(d).not.undefined;
      expect(d.aa).eq(123);

      const b: any = subApp.get('hello1');
      expect(b).not.null;
      expect(b).not.undefined;
      expect(b.aa).eq(1231);

      await app.stop();
      expect(app.registry.identifiers.length).eq(0);
    });
  });
});
