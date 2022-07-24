import assert = require('assert');
import { resolve, join } from 'path';
import { MidwayContainer, MidwayConfigService, MidwayInformationService, MidwayEnvironmentService, MidwayInvalidConfigError } from '../../src';
import * as mm from 'mm';

async function createConfigService(): Promise<MidwayConfigService> {
  const container = new MidwayContainer();
  container.bindClass(MidwayInformationService);
  container.bindClass(MidwayEnvironmentService);
  container.bindClass(MidwayConfigService);

  container.registerObject('baseDir', join(__dirname, 'fixtures/default_case'));
  container.registerObject('appDir', join(__dirname, 'fixtures/default_case'));

  return container.getAsync(MidwayConfigService);
}

describe('/test/service/configService.test.ts', () => {

  it('configService should be ok', async () => {
    const cfg: any = await createConfigService();
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
    const cfg = await createConfigService();
    const configFile = resolve(join(__dirname, '../fixtures/config', 'config.default'));
    cfg.add([configFile]);
    await cfg.load();
    const result = cfg.getConfiguration();
    assert.deepEqual(result, {aa: 1}, 'loadConfig file should be ok');

    mm(process.env, 'NODE_ENV', 'local');
    const cfg1 = await createConfigService();
    const configFileLocal = resolve(join(__dirname, '../fixtures/config', 'config.local'));
    cfg1.add([configFileLocal]);
    await cfg1.load();
    const resultLocal = cfg1.getConfiguration();
    assert.deepEqual(resultLocal, {aa: 1, local: 2}, 'loadConfig file should be ok');

    mm(process.env, 'NODE_ENV', 'daily');
    const cfg2 = await createConfigService();
    const configFileDaily = resolve(join(__dirname, '../fixtures/config', 'config.daily'));
    cfg2.add([configFileDaily]);
    await cfg2.load();
    const resultDaily = cfg2.getConfiguration();
    assert.deepEqual(resultDaily, {aa: 2, daily: 1}, 'loadConfig file should be ok');

    mm(process.env, 'NODE_ENV', 'pre');
    const cfg3 = await createConfigService();
    const configFilePre = resolve(join(__dirname, '../fixtures/config', 'config.pre'));
    cfg3.add([configFilePre]);
    await cfg3.load();
    const resultPre = cfg3.getConfiguration();
    assert.deepEqual(resultPre, {}, 'loadConfig file should be ok');

    mm.restore();
  });

  it('getConfigEnv should be ok', async () => {
    const cfg: any = await createConfigService();
    const configFile = resolve(join(__dirname, '../fixtures/config', 'config.daily.ts'));
    const env = cfg.getConfigEnv(configFile);
    assert.equal(env, 'daily', 'getConfigEnv should be ok');
  });

  it('load should be ok', async () => {
    const cfg = await createConfigService();

    cfg.addObject({bb: 222});

    cfg.add([join(__dirname, '../fixtures/config', 'config.daily'),
      join(__dirname, '../fixtures/config', 'config.default'),
      join(__dirname, '../fixtures/config', 'config.local'),
      join(__dirname, '../fixtures/config', 'config.pre'),
      join(__dirname, '../fixtures/config', 'config.prod'),
      join(__dirname, '../fixtures/config', 'config.test')]);

    await cfg.load();

    assert.ok(Object.keys(cfg.getConfiguration()).length === 2);
    assert.ok(cfg.getConfiguration().bb === 222);
    assert.ok(cfg.getConfiguration().aa === 1);
  });

  it('should test default', async () => {
    const cfg: any = await createConfigService();
    const configFile = resolve(join(__dirname, './fixtures/default_case', 'config.default'));
    const result = await cfg.loadConfig(configFile);
    expect(result.parent).toEqual({a: 1, b:2});
    const configFileLocal = resolve(join(__dirname, './fixtures/default_case', 'config.local'));
    const resultLocal = await cfg.loadConfig(configFileLocal);
    expect(resultLocal.parent).toEqual({a: 1});
  });

  it('invalid config', async () => {
    const cfg: any = await createConfigService()
    let configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case1.fail'));
    let err;
    try {
      await cfg.loadConfig(configFile);
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(MidwayInvalidConfigError)

    configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case2.ok'));
    await cfg.loadConfig(configFile);

    configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case3.ok'));
    await cfg.loadConfig(configFile);

    configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case4.ok'));
    await cfg.loadConfig(configFile);

    configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case5.ok'));
    await cfg.loadConfig(configFile);

    configFile = resolve(join(__dirname, './fixtures/invalid_case', 'case6.ok'));
    await cfg.loadConfig(configFile);
  })

  it('should compatible old production', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'production');
    const cfg = await createConfigService();

    cfg.add([
      join(__dirname, './fixtures/compatible_production'),
    ]);

    await cfg.load();

    expect(cfg.getConfiguration()).toEqual({
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
    const cfg = await createConfigService();

    cfg.add([
      join(__dirname, './fixtures/compatible_production'),
    ]);

    await cfg.load();

    expect(cfg.getConfiguration()).toEqual({
      key: {
        data: 123,
      },
      bbb: {
        data: 321,
      }
    })
    mm.restore()
  });

  it('should compatible old test with object mode', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'test');
    const cfg = await createConfigService();

    cfg.add([
      {
        default: {
          key: {
            data: 123,
          }
        },
        prod: {
          bbb: {
            data: 123,
          }
        },
        unittest: {
          bbb: {
            data: 321
          }
        }
      }
    ]);

    await cfg.load();

    expect(cfg.getConfiguration()).toEqual({
      key: {
        data: 123,
      },
      bbb: {
        data: 321,
      }
    })
    mm.restore()
  });

  it('should test config merge order', async () => {
    mm(process.env, 'MIDWAY_SERVER_ENV', 'test');
    const cfg = await createConfigService();

    cfg.add([
      join(__dirname, './fixtures/compatible_production'),
    ]);

    await cfg.load();

    expect(cfg.getConfigMergeOrder().length).toEqual(2)

    cfg.clearConfigMergeOrder();

    expect(cfg.getConfigMergeOrder().length).toEqual(0);
    mm.restore()
  });

  it('should test config add with reverse', async () => {
    const cfg = await createConfigService();

    cfg.addObject({bb: 222});

    await cfg.load();

    cfg.addObject({bb: 111, cc: 222}, true);

    assert.ok(Object.keys(cfg.getConfiguration()).length === 2);
    assert.ok(cfg.getConfiguration().bb === 222);
    assert.ok(cfg.getConfiguration().cc === 222);
  });

  it('should test config filter', async () => {
    const cfg = await createConfigService();

    cfg.addFilter((config) => {
      if (config['bb']) {
        config['bb'] = '111';
      }
      return config;
    });

    cfg.addObject({bb: 222});

    await cfg.load();

    expect(cfg.getConfiguration().bb).toEqual('111');

    cfg.addObject({bb: 333, cc: 222});

    expect(cfg.getConfiguration().bb).toEqual('111');
    expect(cfg.getConfiguration().cc).toEqual(222);
  });
});
