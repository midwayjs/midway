import * as util from 'util';
import * as assert from 'assert';
import { FaaSStarter, IFaaSStarter } from '../src/';

class MockStarter {

  args;
  starter: IFaaSStarter;
  routeMapping = 'handler';
  private asserts = [];

  constructor({ starter }) {
    this.starter = starter;
  }

  async ready() {
    await this.starter.start();
    return this;
  }

  handler(routeMapping) {
    this.routeMapping = routeMapping;
    return this;
  }

  invoke(...args) {
    this.args = args;
    return this;
  }

  expect(pattern: RegExp | string | object | ((result) => any), fn?: () => any) {
    if (typeof pattern === 'function') {
      this.asserts.push(pattern);
      return this;
    }

    if (typeof fn === 'function') {
      this.end(fn);
    }

    this.asserts.push(this.assertResult.bind(this, pattern));

    return this;
  }

  end(fn: (result) => boolean) {
    return Promise.resolve(this.starter.handleInvokeWrapper(this.routeMapping).apply(this.starter, this.args))
      .then((result) => {
        this.assert(null, result, fn);
        this.clearContext();
      })
      .catch((err) => {
        this.assert(err, null, fn);
        this.clearContext();
      });
  }

  clearContext() {
    this.asserts = [];
    (this.starter as any).context = null;
  }

  assertResult(pattern, latestResult) {
    const isregexp = pattern instanceof RegExp;
    const b = util.inspect(latestResult);
    if (isregexp) {
      if (!(pattern as RegExp).test(latestResult)) {
        return error('expected ' + b + ' to match ' + pattern, pattern, latestResult);
      }
    } else if ((typeof pattern === 'string' || typeof pattern === 'object') && !isregexp) {
      const a = util.inspect(pattern);
      try {
        assert.deepStrictEqual(pattern, latestResult);
      } catch (err) {
        return error('expected ' + a + ' result, got ' + b, pattern, latestResult);
      }
    }
  }

  assert(resError, res, fn) {
    let error;
    let i;

    // check for unexpected network errors or server not running/reachable errors
    // when there is no response and superagent sends back a System Error
    // do not check further for other asserts, if any, in such case
    // https://nodejs.org/api/errors.html#errors_common_system_errors
    const sysErrors = {
      ECONNREFUSED: 'Connection refused',
      ECONNRESET: 'Connection reset by peer',
      EPIPE: 'Broken pipe',
      ETIMEDOUT: 'Operation timed out'
    };

    if (!res && resError) {
      if (resError instanceof Error && (resError as any).syscall === 'connect'
        && Object.getOwnPropertyNames(sysErrors).indexOf((resError as any).code) >= 0) {
        error = new Error((resError as any).code + ': ' + sysErrors[ (resError as any).code ]);
      } else {
        error = resError;
      }
    }

    // asserts
    for (i = 0; i < this.asserts.length && !error; i += 1) {
      error = this.assertFunction(this.asserts[ i ], res);
    }

    // set unexpected superagent error if no other error has occurred.
    if (!error && resError instanceof Error && (!res || (resError as any).status !== res.status)) {
      error = resError;
    }

    fn.call(this, error || null, res);

  }

  assertFunction(fn, res) {
    let err;
    try {
      err = fn(res);
    } catch (e) {
      err = e;
    }
    if (err instanceof Error) {
      return err;
    }
  }

}

function error(msg, expected, actual) {
  const err: any = new Error(msg);
  err.expected = expected;
  err.actual = actual;
  err.showDiff = true;
  return err;
}

export async function createServerlessMock(options: {
  baseDir?: string;
  typescript?: boolean;
}) {
  const starter = new MockStarter({
    starter: new FaaSStarter(options),
  });
  await starter.ready();
  return starter;
}
