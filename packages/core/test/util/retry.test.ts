import { MidwayRetryExceededMaxTimesError, retryWithAsync, retryWith } from '../../src';
import { sleep } from '@midwayjs/decorator';

describe('test/util/retry.test.ts', function () {

  class TestService {
    initData = 'hello';
    invokeTimes = 0;
    async getUserAsync(name: string) {
      await sleep(10);
      if (this.invokeTimes < 2) {
        this.invokeTimes++;
        throw new Error('timeout error');
      }
      return this.initData + ' ' + name;
    }

    getUser(name: string) {
      if (this.invokeTimes < 2) {
        this.invokeTimes++;
        throw new Error('timeout error');
      }
      return this.initData + ' ' + name;
    }
  }

  describe('wrap async function', function () {
    it('should test anonymous function with this', async () => {
      const originFn = async (a, b, c) => {
        await sleep(100);
        return a + b + c;
      }
      const retryFn = retryWithAsync(originFn);

      expect(await retryFn('a', 'b', 'c')).toEqual('abc');
    });


    it('should test retry invoke method with default retry number and fail', async () => {
      const service = new TestService();
      const fn = retryWithAsync(service.getUserAsync.bind(service))

      await expect(async () => {
        await fn('harry');
      }).rejects.toThrowError(MidwayRetryExceededMaxTimesError);
    });

    it('should test retry invoke method with origin error', async () => {
      const service = new TestService();
      const fn = retryWithAsync(service.getUserAsync, 1, {
        throwOriginError: true,
        receiver: service,
      });

      await expect(async () => {
        await fn('harry');
      }).rejects.toThrowError(Error);
    });

    it('should test retry invoke method and will be success', async () => {
      const service = new TestService();
      const fn = retryWithAsync(service.getUserAsync, 2, {
        receiver: service,
      });

      const result = await fn('harry');
      expect(result).toEqual('hello harry');
    });

    it('should test anonymous function', async () => {
      const fn = retryWithAsync(async () => {
        throw new Error('error');
      }, 2);

      await expect(async () => {
        await fn();
      }).rejects.toThrowError('anonymous');
    });

    it('should test with retry interval', async () => {
      let idx = 0;
      const start = Date.now();
      const fn = retryWithAsync(async () => {
        if (idx++ < 2) {
          throw new Error('error');
        } else {
          return 'ok';
        }
      } , 2, {
        retryInterval: 1000
      });

      const result = await fn();
      expect(result).toEqual('ok');
      expect(Date.now() - start).toBeGreaterThanOrEqual(2000);
    });
  });

  describe('wrap sync function', function () {

    it('should test anonymous function with this',  () => {
      const originFn = (a, b, c) => {
        return a + b + c;
      }
      const retryFn = retryWith(originFn);

      expect(retryFn('a', 'b', 'c')).toEqual('abc');
    });

    it('should test retry invoke method with default retry number and fail', () => {
      const service = new TestService();
      const fn = retryWith(service.getUser.bind(service))

      expect(() => {
        fn('harry');
      }).toThrowError(MidwayRetryExceededMaxTimesError);
    });

    it('should test retry invoke method with origin error', () => {
      const service = new TestService();
      const fn = retryWith(service.getUser, 1, {
        throwOriginError: true,
        receiver: service,
      });

      expect(() => {
        fn('harry');
      }).toThrowError(Error);
    });

    it('should test retry invoke method and will be success', () => {
      const service = new TestService();
      const fn = retryWith(service.getUser, 2, {
        receiver: service,
      });

      const result = fn('harry');
      expect(result).toEqual('hello harry');
    });

    it('should test anonymous function', () => {
      const fn = retryWith(() => {
        throw new Error('error');
      }, 2);

      expect(() => {
        fn();
      }).toThrowError('anonymous');
    });
  });
});
