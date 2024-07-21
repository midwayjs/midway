import { ServerResponse } from '../src';

describe('ServerStreamResponse', () => {
  it('should test', () => {
    const response = new ServerResponse({});
    expect(ServerResponse.SUCCESS_TPL).toBeDefined();
    expect(response.constructor['SUCCESS_TPL']).toEqual(ServerResponse.SUCCESS_TPL);

    class ServerResponseNew extends ServerResponse {}
    const responseNew = new ServerResponseNew({});
    expect(ServerResponseNew['SUCCESS_TPL']).toEqual(ServerResponse.SUCCESS_TPL);
    expect(responseNew.constructor['SUCCESS_TPL']).toEqual(response.constructor['SUCCESS_TPL'])

    ServerResponseNew.SUCCESS_TPL = (data: string) => {
      return {
        bbb: 0,
        data,
      }
    }

    const fn = jest.fn();
    const res = new ServerResponseNew({
      res: {
        writeHead: fn,
      },
    }).success().text('abc');

    expect(fn).toBeCalledWith('Content-Type', 'text/plain');
    expect(res).toEqual({ bbb: 0, data: 'abc' });
  });
});
