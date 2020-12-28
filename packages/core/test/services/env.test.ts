import assert = require('assert');
import { MidwayEnvironmentService } from '../../src/service/environmentService';

describe('/test/services/env.test.ts', () => {
  it('environmentService should be ok', () => {
    const midEnv = new MidwayEnvironmentService();
    midEnv.setCurrentEnvironment('local1');

    assert.equal(midEnv.getCurrentEnvironment(), 'local1', 'current environment not equal local1');
  });

  it('should test is development env', function () {
    const env = new MidwayEnvironmentService();
    env.setCurrentEnvironment('local');
    expect(env.isDevelopmentEnvironment()).toBeTruthy();

    env.setCurrentEnvironment('test');
    expect(env.isDevelopmentEnvironment()).toBeTruthy();

    env.setCurrentEnvironment('unittest');
    expect(env.isDevelopmentEnvironment()).toBeTruthy();

    env.setCurrentEnvironment('prod');
    expect(env.isDevelopmentEnvironment()).toBeFalsy();
  });
});
