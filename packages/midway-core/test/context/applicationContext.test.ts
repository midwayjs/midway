import { ObjectDefinition } from '../../src/definitions/objectDefinition';
import { ObjectDefinitionRegistry, BaseApplicationContext } from '../../src/context/applicationContext';
import sinon = require('sinon');
import { expect } from 'chai';

describe('/test/context/applicationContext.test.ts', () => {
  describe('ObjectDefinitionRegistry', () => {
    it('should be ok', () => {
      const definition = new ObjectDefinition();
      definition.id = 'hello1';

      const registry = new ObjectDefinitionRegistry();
      registry.registerDefinition(definition.id, definition);

      const definition1 = new ObjectDefinition();
      definition1.id = 'hello1';
      definition1.path = '/test/hello1';
      registry.registerDefinition(definition1.id, definition1);

      expect(registry.hasDefinition(definition.id)).true;
      expect(registry.getDefinition(definition.id)).not.null;
      expect(registry.identifiers).deep.eq([definition.id]);
      expect(registry.count).eq(1);
      expect(registry.getDefinitionByPath(definition1.path)).not.null;
      expect(registry.getDefinitionByPath('/test')).is.null;

      registry.clearAll();
      expect(registry.count).eq(0);
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
    it('context event should be ok', async () => {
      const callback = sinon.spy();
      const app = new BaseApplicationContext(__dirname);

      const listen = {
        key: 'hello world',
        async onStart() {
          callback('onStart');
        },
        async onReady() {
          callback('onReady');
        },
        async onRefresh() {
          callback('onRefresh');
        },
        async onStop() {
          callback('onStop');
        }
      };
      app.addLifeCycle(listen);
      await app.ready();
      await app.stop();
      app.removeLifeCycle();

      expect(callback.callCount).eq(4);
      expect(callback.withArgs('onStart').calledOnce).true;
      expect(callback.withArgs('onReady').calledOnce).true;
      expect(callback.withArgs('onRefresh').calledOnce).true;
      expect(callback.withArgs('onStop').calledOnce).true;
    });
  });
});
