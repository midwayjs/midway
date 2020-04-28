import { Application, Agent } from '../src/midway';
import * as assert from 'assert';

describe('/test/midway.test.ts', () => {
  it('MidwayApplication should be ok', () => {
    const app = new Application();
    assert(app.enablePlugins);

    assert(!app.getConfig('test'));
    (app as any).config['test'] = 'hello world';
    assert(app.getConfig('test') === 'hello world');

    assert(app.getConfig()['test'] === 'hello world');
    assert(app.getConfig()['session']);

    assert(app.getPluginContext());
    assert(app.pluginContext);
    try {
      assert(app.getPlugin('schedulePlus'));
    } catch (e) {
      assert(e.message === 'schedulePlus is not valid in current context');
    }
  });

  it('MidwayAgent should be ok', () => {
    const app = new Agent();
    assert(!app.getConfig('test'));
    (app as any).config['test'] = 'hello world';
    assert(app.getConfig('test') === 'hello world');

    assert(app.getConfig()['test'] === 'hello world');
    assert(app.getConfig()['session']);

    assert(app.getPluginContext());
    assert(app.pluginContext);
    assert(app.getApplicationContext());
    assert(app.applicationContext);
    try {
      assert(app.getPlugin('schedulePlus'));
    } catch (e) {
      assert(e.message === 'schedulePlus is not valid in current context');
    }

    assert(app.appDir);
  });
});
