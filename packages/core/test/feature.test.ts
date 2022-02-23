import { createLightFramework } from './util';
import { join } from 'path';
import { MidwayMissingImportComponentError, MidwayDefinitionNotFoundError } from '../src';

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
});
