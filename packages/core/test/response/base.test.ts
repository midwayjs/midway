import { ServerResponse } from '../../src';

describe('response/base.test.ts', () => {
  it('should test base server response', () => {
    const response = new ServerResponse({} as any);
    expect(ServerResponse.SUCCESS_TPL).toBeDefined();
    expect(response.constructor['SUCCESS_TPL']).toEqual(ServerResponse.SUCCESS_TPL);

    class ServerResponseNew extends ServerResponse {}
    const responseNew = new ServerResponseNew({} as any);
    expect(ServerResponseNew['SUCCESS_TPL']).toEqual(ServerResponse.SUCCESS_TPL);
    expect(responseNew.constructor['SUCCESS_TPL']).toEqual(response.constructor['SUCCESS_TPL'])

    expect(ServerResponseNew.SUCCESS_TPL).toBeDefined();
  });

  it('should test response with different type', () => {
    class ServerResponseNew extends ServerResponse {}
    const response = new ServerResponseNew({} as any);

    // success
    let res = response.success().text('abc');
    expect(res).toEqual({ success: 'true', data: 'abc' });

    // fail
    res = response.fail().text('abc');
    expect(res).toEqual({ success: 'false', message: 'abc' });

    // json
    res = response.success().json({ a: 1 });
    expect(res).toEqual({ success: 'true', data: '{"a":1}' });

    // blob
    res = response.success().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));
  });

  it('should test output with different template', () => {
    class ServerResponseNew extends ServerResponse {}
    const response = new ServerResponseNew({} as any);
    let res = response.success().text('abc');
    expect(res).toEqual({ success: 'true', data: 'abc' });

    // success
    ServerResponseNew.SUCCESS_TPL = (data: string) => {
      return {
        bbb: 0,
        data,
      }
    }
    res = response.success().text('abc');
    expect(res).toEqual({ bbb: 0, data: 'abc' });

    // fail
    ServerResponseNew.FAIL_TPL = (data: string) => {
      return {
        bbb: -1,
        message: data || 'fail',
      }
    }
    res = response.fail().text('abc');
    expect(res).toEqual({ bbb: -1, message: 'abc' });

    // json
    res = response.success().json({ a: 1 });
    expect(res).toEqual({ bbb: 0, data: '{"a":1}' });

    res = response.fail().json({ a: 1 });
    expect(res).toEqual({ bbb: -1, message: '{"a":1}' });

    // blob
    res = response.success().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));

    res = response.fail().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));
  });
})
