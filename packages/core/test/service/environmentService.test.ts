import { MidwayEnvironmentService } from '@midwayjs/core';

describe('MidwayEnvironmentService', () => {
  let environmentService: MidwayEnvironmentService;

  beforeEach(() => {
    environmentService = new MidwayEnvironmentService();
  });

  it('should return true when process.pkg is defined', () => {
    process['pkg'] = {};
    expect(environmentService.isPkgEnvironment()).toBe(true);
    delete process['pkg'];
  });

  it('should return false when process.pkg is undefined', () => {
    expect(environmentService.isPkgEnvironment()).toBe(false);
  });
});
