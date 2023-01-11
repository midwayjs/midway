import { AbstractBootstrapStarter } from '../src';

describe('/test/starter.test.ts', () => {
  it('should run with starter', async () => {
    class CustomStarter extends AbstractBootstrapStarter {
      onClose() {
      }

      async onInit(...args: unknown[]) {
        await this.initFramework({});
      }

      async onRequest(...args: unknown[]) {
        return {
          body: 'hello world',
        }
      }

      onStart(): any {
        const exports = {};

        exports['initializer'] = async context => {
          await this.onInit(context, exports);
        }

        if (this.options.handlerName) {
          exports[this.options.handlerName.split('.')[1]] = this.onRequest.bind(this);
        }

        return exports;
      }
    }

    const starter = new CustomStarter({
      handlerName: 'index.handler',
    });
    const mod = starter.start();
    expect(mod['initializer']).toBeDefined();
    expect(await mod['handler']()).toEqual({
      body: 'hello world'
    });

    await starter.close();

  });
});
