import { commonPrefix } from '../src/utils';
import * as assert from 'assert';
describe('/test/commonPrefix.test.ts', () => {
  describe('commonPrefix', () => {
    it('/', async () => {
      const prefix = commonPrefix(['/api/index', '/api/api2', '/']);
      assert(prefix === '');
    });
    it('/*', async () => {
      const prefix = commonPrefix(['/api/index', '/api/api2', '//*']);
      assert(prefix === '');
    });
  });
});
