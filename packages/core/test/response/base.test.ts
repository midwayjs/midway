import { ServerResponse } from '../../src';

describe('response/base.test.ts', () => {
  it('should test response with different type', () => {
    class ServerResponseNew extends ServerResponse {}
    const response = new ServerResponseNew({} as any);

    // success
    let res: any = response.success().text('abc');
    expect(res).toEqual('abc');
    expect(response.text('bcd')).toEqual('bcd');

    // fail
    res = response.fail().text('abc');
    expect(res).toEqual('abc');

    // json
    res = response.success().json({ a: 1 });
    expect(res).toEqual({
      success: 'true', data: {
        'a': 1
      }
    });

    // blob
    res = response.success().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));
  });

  it('should test output with different template', () => {
    class ServerResponseNew extends ServerResponse {}
    const response = new ServerResponseNew({} as any);
    let res = response.success().text('abc');
    expect(res).toEqual('abc');

    ServerResponseNew.TEXT_TPL = (data: string, isSuccess) => {
      return isSuccess ? {
        bbb: 0,
        data,
      } : {
        bbb: -1,
        message: data || 'fail',
      };
    }

    ServerResponseNew.JSON_TPL = (data: Record<any, any>, isSuccess) => {
      return isSuccess ? {
        bbb: 2,
        data,
      } : {
        bbb: 2,
        message: data || 'fail2',
      };
    }

    res = response.success().text('abc');
    expect(res).toEqual({ bbb: 0, data: 'abc' });

    res = response.fail().text('abc');
    expect(res).toEqual({ bbb: -1, message: 'abc' });

    // json
    res = response.success().json({ a: 1 });
    expect(res).toEqual({ bbb: 2, data: { a: 1 } });

    res = response.fail().json({ a: 1 });
    expect(res).toEqual({ bbb: 2, message: { a: 1 } });

    // blob
    res = response.success().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));

    res = response.fail().blob(Buffer.from('abc'));
    expect(res).toEqual(Buffer.from('abc'));
  });

  it("should test with ctx", () => {
    class ServerResponseNew extends ServerResponse {}
    const response = new ServerResponseNew({
      data: {
        text: '123',
      }
    } as any);
    let res = response.success().text('abc');
    expect(res).toEqual('abc');

    ServerResponseNew.TEXT_TPL = (data: string, isSuccess, ctx: any) => {
      return isSuccess ? {
        bbb: 0,
        data,
        ...ctx.data,
      } : {
        bbb: -1,
        message: data || 'fail',
      };
    }

    ServerResponseNew.JSON_TPL = (data: Record<any, any>, isSuccess, ctx: any) => {
      return isSuccess ? {
        bbb: 2,
        data,
        ...ctx.data,
      } : {
        bbb: 2,
        message: data || 'fail2',
      };
    }

    res = response.success().text('abc');
    expect(res).toEqual({ bbb: 0, data: 'abc', text: '123' });

    // json
    res = response.success().json({ a: 1 });
    expect(res).toEqual({ bbb: 2, data: { a: 1 }, text: '123' });
  });
})
