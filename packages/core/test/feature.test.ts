import { createLightFramework } from './util';
import { join } from 'path';
import { MidwayDefinitionNotFoundError } from '../src';
import { MidwayHealthService } from '../src/service/healthService';

describe('/test/feature.test.ts', () => {
  it.skip('should throw error when inject', async () => {
    let err;
    try {
      await createLightFramework(join(
        __dirname,
        './fixtures/base-app-not-import-throw-error/src'
      ));
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(() => {
      throw err;
    }).toThrowError(MidwayDefinitionNotFoundError);
  });

  it('should throw error when ignore path by detectorOptions', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/app-with-configuration-detector/src'
    ), {}, {
      defaultDetector: false,
    });
    const b = framework.getApplicationContext().get('controllerB');
    expect(b).toBeDefined();

    expect(() => {
      framework.getApplicationContext().get('controllerA')
    }).toThrowError(MidwayDefinitionNotFoundError);
  });

  it('should test onStop sequence in lifecycle', async () => {
    process.env.RUN_READY_FLAG = '';
    process.env.RUN_STOP_FLAG = '';
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/base-app-configuration-stop-reverse/src'
    ));

    expect(process.env.RUN_READY_FLAG).toEqual('b');
    await framework.stop();
    expect(process.env.RUN_STOP_FLAG).toEqual('a');

    process.env.RUN_READY_FLAG = '';
    process.env.RUN_STOP_FLAG = '';
    const framework2 = await createLightFramework(join(
      __dirname,
      './fixtures/base-app-configuration-stop-reverse/src'
    ));

    expect(process.env.RUN_READY_FLAG).toEqual('b');
    await framework2.stop();
    expect(process.env.RUN_STOP_FLAG).toEqual('a');
  });

  it('should test health check service', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/app-with-health-check/src'
    ));
    const healthService = await framework.getApplicationContext().getAsync(MidwayHealthService);
    healthService.setCheckTimeout(200);
    const result = await healthService.getStatus();
    expect(result).toEqual({
      "results": [
        {
          "namespace": "__main__",
          "status": true
        }
      ],
      "status": true
    });

    healthService.setCheckTimeout(50);

    const resultFail = await healthService.getStatus();
    expect(resultFail).toEqual({
      "reason": "Invoke \"configuration.onHealthCheck\" running timeout(50ms)",
      "namespace": "__main__",
      "results": [
        {
          "namespace": "__main__",
          "reason": "Invoke \"configuration.onHealthCheck\" running timeout(50ms)",
          "status": false
        }
      ],
      "status": false
    });

    await framework.stop();
  });

  it('should test health check service and return empty in code', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/app-with-health-check-empty/src'
    ));
    const healthService = await framework.getApplicationContext().getAsync(MidwayHealthService);
    healthService.setCheckTimeout(200);
    const result = await healthService.getStatus();
    expect(result).toEqual({
      "reason": "configuration.onHealthCheck return value must be object and contain status field",
      "namespace": "__main__",
      "results": [
        {
          "namespace": "__main__",
          "reason": "configuration.onHealthCheck return value must be object and contain status field",
          "status": false
        }
      ],
      "status": false
    });

    await framework.stop();
  });
});
