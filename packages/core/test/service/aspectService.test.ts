import { MidwayAspectService, MidwayContainer } from '../../src';

describe('/test/service/aspectService.test.ts', () => {
  it('aspect normal method and async method should be ok', async() => {

    class A {
      async invokeAsyncMethod() {
        return 'hello world';
      }

      invokeMethod(a, b) {
        return {
          a,
          b,
        };
      }

      gotError() {
        throw new Error('another error');
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);

    const aspectService = await container.getAsync(MidwayAspectService, [
      container
    ]);

    // test multi-round
    aspectService.interceptPrototypeMethod(A, 'invokeAsyncMethod', {
      around: async (joinPoint) => {
        console.log('before1');
        const result = await joinPoint.proceed(...joinPoint.args);
        console.log('after1');
        return result + ' midway 2.0';
      }
    });

    aspectService.interceptPrototypeMethod(A, 'invokeAsyncMethod', {
      around: async (joinPoint) => {
        console.log('before2');
        const result = await joinPoint.proceed(...joinPoint.args);
        console.log('after2');
        return result + ' midway 3.0';
      }
    });

    // test before
    aspectService.interceptPrototypeMethod(A, 'invokeMethod', {
      before: (joinPoint) => {
        joinPoint.args = [3, 4];
      }
    });

    let err;
    aspectService.interceptPrototypeMethod(A, 'gotError', {
      afterThrow: (joinPoint, error) => {
        err = error;
      }
    });

    const a = new A();
    expect(await a.invokeAsyncMethod()).toEqual('hello world midway 2.0 midway 3.0');
    expect(a.invokeMethod(1,2)).toEqual({
      a: 3,
      b: 4,
    })
    a.gotError();

    expect(err.message).toEqual('another error');
  });

});
