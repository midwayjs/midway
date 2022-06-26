import *  as mm from 'mm';
import { ServerlessBaseRuntime } from '../src';

describe('/test/runtime.test.ts', function () {
  it('should test env and get function name and service name', function () {
    mm(process.env, 'MIDWAY_SERVERLESS_FUNCTION_NAME',  'ccc');
    mm(process.env, 'MIDWAY_SERVERLESS_SERVICE_NAME',  'ddd');
    const runtime = new ServerlessBaseRuntime();
    expect(runtime.getFunctionName()).toEqual('ccc');
    expect(runtime.getFunctionServiceName()).toEqual('ddd');
    mm.restore();
  });
});
