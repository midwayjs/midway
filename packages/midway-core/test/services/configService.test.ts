import assert = require('assert');
import { resolve, join } from 'path';
import { MidwayContainer } from '../../src/context/midwayContainer';
import { MidwayConfigService } from '../../src/service/configService';

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
});
