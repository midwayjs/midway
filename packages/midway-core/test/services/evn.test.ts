import assert = require('assert');
import { MidwayEnvironmentService } from '../../src/service/environmentService';

describe('/test/services/env.test.ts', () => {
  it('environmentService should be ok', () => {
    const midEnv = new MidwayEnvironmentService();
    midEnv.setCurrentEnvironment('local1');

    assert.equal(midEnv.getCurrentEnvironment(), 'local1', 'current environment not equal local1');
  });
});
