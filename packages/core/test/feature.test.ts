import { createLightFramework } from './util';
import { join } from 'path';
import { MidwayMissingImportComponentError, MidwayDefinitionNotFoundError } from '../src';
import { MidwayHealthService } from '../src/service/healthService';

describe('/test/feature.test.ts', () => {
  it('should throw error when inject', async () => {
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
    }).toThrowError(MidwayMissingImportComponentError);
  });

  it('should throw error when ignore path by detectorOptions', async () => {
    const framework = await createLightFramework(join(
      __dirname,
      './fixtures/app-with-configuration-detector/src'
    ));
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
      "reasons": [
        {
          "status": true
        }
      ],
      "status": true
    });

    healthService.setCheckTimeout(50);

    const resultFail = await healthService.getStatus();
    expect(resultFail).toEqual({
      "reason": "Invoke \"configuration.onHealthCheck\" running timeout(50ms)",
      "reasons": [
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
});
