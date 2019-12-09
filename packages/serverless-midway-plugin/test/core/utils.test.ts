import * as assert from 'assert';
import { formatLayers } from '../../src/core/utils';

describe('/test/core/utils.ts', () => {
  it('formatLayers', async () => {
    const layerTypeList: any =  formatLayers({
      test: {
        path: 'npm:debug'
      },
      test2: {
        path: 'npm:midway'
      }
    });
    assert(layerTypeList.npm &&
      layerTypeList.npm.test === 'debug' &&
      layerTypeList.npm.test2 === 'midway'
    );
  });
});
