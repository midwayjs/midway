import * as assert from 'assert';
import { formatLayers, commonPrefix } from '../../src/core/utils';

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
  describe('/test/core/utils.ts/commonPrefix', () => {
    it('commonPrefix single', async () => {
      assert(commonPrefix(['single']) === '/single');
    });
    it('commonPrefix default', async () => {
      assert(commonPrefix([]) === '');
    });
    it('commonPrefix empty', async () => {
      assert(commonPrefix(['', '', '']) === '');
    });
    it('commonPrefix /', async () => {
      assert(commonPrefix(['/a', '/b', '/c']) === '/');
    });
    it('commonPrefix / 2', async () => {
      assert(commonPrefix(['/a/', '/', '/a/b', '/c']) === '/');
    });
    it('commonPrefix /a', async () => {
      assert(commonPrefix(['/a/', '/a', '/a/b']) === '/a');
    });
    it('commonPrefix /a 2', async () => {
      assert(commonPrefix(['/a/', '/ac', '/a/b']) === '/');
    });
  });
});
