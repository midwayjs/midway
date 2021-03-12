import assert = require('assert');
import { resolve, join } from 'path';
import { MidwayContainer } from '../../src';
import { MidwayConfigService } from '../../src/service/configService';
import * as mm from 'mm';

describe('/test/services/configService.test.ts', () => {
  it('configService should be ok', () => {
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);
    cfg.isReady = true;
    cfg.configuration = {t: 1};
    cfg.addObject({a: {b: 1}});

    assert.equal(cfg.getConfiguration('a.b'), 1, 'getConfiguration a.b should be 1');

    cfg.isReady = false;
    cfg.addObject({a: {b: 2}});

    assert.equal(cfg.externalObject.length, 1, 'externalObject should be 1');

    assert.deepEqual(cfg.getConfiguration(undefined), {t: 1, a: {b: 1}}, 'get undefined should be ok');
  });

  it('load config should be ok', async () => {
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);
    const configFile = resolve(join(__dirname, '../fixtures/config', 'config.default'));
    const result = await cfg.loadConfig(configFile);
    assert.deepEqual(result, {aa: 1}, 'loadConfig file should be ok');

    const configFileLocal = resolve(join(__dirname, '../fixtures/config', 'config.local'));
    const resultLocal = await cfg.loadConfig(configFileLocal);
    assert.deepEqual(resultLocal, {aa: 1, local: 2}, 'loadConfig file should be ok');

    const configFileDaily = resolve(join(__dirname, '../fixtures/config', 'config.daily'));
    const resultDaily = await cfg.loadConfig(configFileDaily);
    assert.deepEqual(resultDaily, {aa: 2, daily: 1}, 'loadConfig file should be ok');

    const configFilePre = resolve(join(__dirname, '../fixtures/config', 'config.pre'));
    const resultPre = await cfg.loadConfig(configFilePre);
    assert.deepEqual(resultPre, {}, 'loadConfig file should be ok');
  });

  it('getConfigEnv should be ok', () => {
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);
    const configFile = resolve(join(__dirname, '../fixtures/config', 'config.daily.ts'));
    const env = cfg.getConfigEnv(configFile);
    assert.equal(env, 'daily', 'getConfigEnv should be ok');
  });

  it('load should be ok', async () => {
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);

    cfg.addObject({bb: 222});

    cfg.add([join(__dirname, '../fixtures/config', 'config.daily'),
      join(__dirname, '../fixtures/config', 'config.default'),
      join(__dirname, '../fixtures/config', 'config.local'),
      join(__dirname, '../fixtures/config', 'config.pre'),
      join(__dirname, '../fixtures/config', 'config.prod'),
      join(__dirname, '../fixtures/config', 'config.test')]);

    await cfg.load();

    assert.ok(Object.keys(cfg.configuration).length === 2);
    assert.ok(cfg.configuration.bb === 222);
    assert.ok(cfg.configuration.aa === 1);
  });

  it('should test default', async () => {
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);

    const configFile = resolve(join(__dirname, './fixtures/default_case', 'config.default'));
    const result = await cfg.loadConfig(configFile);
    expect(result.parent).toEqual({a: 1, b:2});
    const configFileLocal = resolve(join(__dirname, './fixtures/default_case', 'config.local'));
    const resultLocal = await cfg.loadConfig(configFileLocal);
    expect(resultLocal.parent).toEqual({a: 1});
  });

  it('should compatible old production', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'production');
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);

    cfg.add([
      join(__dirname, './fixtures/compatible_production'),
    ]);

    await cfg.load();

    expect(cfg.configuration).toEqual({
      key: {
        data: 123,
      },
      bbb: {
        data: 123,
      }
    })
    mm.restore()
  });

  it('should compatible old test', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'test');
    const container = new MidwayContainer();
    const cfg = new MidwayConfigService(container);

    cfg.add([
      join(__dirname, './fixtures/compatible_production'),
    ]);

    await cfg.load();

    expect(cfg.configuration).toEqual({
      key: {
        data: 123,
      },
      bbb: {
        data: 321,
      }
    })
    mm.restore()
  });
});
