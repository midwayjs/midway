import { createLightFramework } from './util';
import { join } from 'path';
import { MidwayMissingImportComponentError } from '../src';

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
});
