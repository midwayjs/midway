import {
  FrameworkErrorEnum, MidwayConfigMissingError, MidwayFeatureNoLongerSupportedError, MidwayFeatureNotImplementedError,
  MidwayInconsistentVersionError,
  MidwayInvokeForbiddenError,
  MidwayResolverMissingError
} from '../../src';

describe('/test/error/framework.test.ts', function () {
  it('should test MidwayInvokeForbiddenError', function () {
    const err = new MidwayInvokeForbiddenError('invoke');
    expect(err.message).toEqual('Invoke "unknown.invoke" is forbidden.');
    expect(err.code).toEqual(FrameworkErrorEnum.INVOKE_METHOD_FORBIDDEN);

    class TestModule {
      invoke() {}
    }
    const err1 = new MidwayInvokeForbiddenError('invoke', TestModule);
    expect(err1.message).toEqual('Invoke "TestModule.invoke" is forbidden.');
  });

  it('should test MidwayInconsistentVersionError', function () {
    const err = new MidwayInconsistentVersionError()
    expect(err.message).toEqual('We find a latest dependency package installed, please remove the lock file and use "npm update" to upgrade all dependencies first.');
    expect(err.code).toEqual(FrameworkErrorEnum.INCONSISTENT_VERSION);
  });

  it('should test MidwayResolverMissingError', function () {
    const err = new MidwayResolverMissingError('test');
    expect(err.message).toEqual('Resolver "test" is missing.');
    expect(err.code).toEqual(FrameworkErrorEnum.MISSING_RESOLVER);
  });

  it('should test MidwayConfigMissingError', function () {
    const err = new MidwayConfigMissingError('test');
    expect(err.message).toEqual('Can\'t found config key "test" in your config, please set it first');
    expect(err.code).toEqual(FrameworkErrorEnum.MISSING_CONFIG);
  });

  it('should test MidwayFeatureNotImplementedError', function () {
    const err = new MidwayFeatureNotImplementedError('test');
    expect(err.message).toEqual('This feature not implemented \n' +
      'test');
    expect(err.code).toEqual(FrameworkErrorEnum.FEATURE_NOT_IMPLEMENTED);
  });

  it('should test MidwayFeatureNoLongerSupportedError', function () {
    const err = new MidwayFeatureNoLongerSupportedError('test');
    expect(err.message).toEqual('This feature no longer supported \n' +
      'test');
    expect(err.code).toEqual(FrameworkErrorEnum.FEATURE_NO_LONGER_SUPPORTED);
  });
});
