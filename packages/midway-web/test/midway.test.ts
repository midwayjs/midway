import { Application, Agent } from '../src/midway';
import mm = require('mm');
import assert = require('assert');
import fs = require('fs');

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
    assert(app.getAppDir());
    assert(app.getBaseDir());
    assert(app.getEnv());
    assert(app.getMidwayType() === 'MIDWAY_EGG');
    assert(app.getProcessType() === 'APPLICATION');

    mm(fs, 'writeFileSync', () => {
      throw new Error('file not found');
    });
    const msgs = [];
    mm(app.coreLogger, 'warn', (msg) => {
      msgs.push(msg);
    });
    app.dumpConfig();
    mm.restore();
    assert(msgs[2] === 'dump dependency dot error: file not found');
    assert(msgs[3] === 'dumpConfig midway-router.json error: file not found');
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

    assert(app.getAppDir());
    assert(app.getBaseDir());
    assert(app.getEnv());
    assert(app.getMidwayType() === 'MIDWAY_EGG');
    assert(app.getProcessType() === 'AGENT');

    mm(fs, 'writeFileSync', () => {
      throw new Error('file not found');
    });
    const msgs = [];
    mm(app.coreLogger, 'warn', (msg) => {
      msgs.push(msg);
    });
    app.dumpConfig();
    mm.restore();
    assert(msgs[1] === 'dump dependency dot error: file not found');
  });
});
