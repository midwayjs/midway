import { FilterManager, MidwayContainer, MidwayError } from '../../src';
import { Catch, Match } from '@midwayjs/decorator';

describe('/test/common/filterManager.test.ts', function () {
  it('should test default error filter', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Catch()
    class TestFilter {
      catch(err, ctx) {
        return {
          status: 500,
          message: err.message
        }
      }
    }
    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runErrorFilter(new Error('test error'), {} as any);

    expect(result).toEqual({
      status: 500,
      message: 'test error',
    })
    expect(error).toBeUndefined();
  });

  it('should test default error and throw new error', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Catch()
    class TestFilter {
      catch(err, ctx) {
        throw new Error('aaabbb');
      }
    }
    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    let msg;
    try {
      await filterManager.runErrorFilter(new Error('test error'), {} as any);
    } catch (err) {
      msg = err.message;
    }

    expect(msg).toEqual('aaabbb');
  });

  it('should test different error in catch', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    class CustomError extends MidwayError {}

    class CustomError2 extends MidwayError {}

    @Catch(CustomError2)
    class TestFilter {
      catch(err, ctx) {
        return {
          status: 500,
          err
        }
      }
    }

    @Catch(CustomError)
    class TestFilter11 {
      catch(err, ctx) {
        return {
          status: 500,
          err
        }
      }
    }

    container.bindClass(TestFilter);
    container.bindClass(TestFilter11);
    filterManager.useFilter(TestFilter);
    filterManager.useFilter(TestFilter11);
    await filterManager.init(container);

    const { result, error } = await filterManager.runErrorFilter(new CustomError('test error'), {} as any);

    expect(result.err.name).toEqual('CustomError');
    expect(error).toBeUndefined();

    const { result: result2, error: error2 } = await filterManager.runErrorFilter(new CustomError2('test error'), {} as any);

    expect(result2.err.name).toEqual('CustomError2');
    expect(error2).toBeUndefined();
  });

  it('should test one catch class got two error', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    class CustomError extends MidwayError {}

    class CustomError2 extends MidwayError {}

    @Catch([CustomError, CustomError2])
    class TestFilter {
      catch(err, ctx) {
        return {
          status: 500,
          err
        }
      }
    }

    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runErrorFilter(new CustomError('test error'), {} as any);

    expect(result.err.name).toEqual('CustomError');
    expect(error).toBeUndefined();

    const { result: result2, error: error2 } = await filterManager.runErrorFilter(new CustomError2('test error'), {} as any);

    expect(result2.err.name).toEqual('CustomError2');
    expect(error2).toBeUndefined();
  });

  it('should test all match with empty args', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Match()
    class TestFilter {
      match(result, ctx) {
        return result + ', midway';
      }
    }

    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runResultFilter('hello world', {} as any);

    expect(result).toEqual('hello world, midway');
    expect(error).toBeUndefined();
  });

  it('should test match path', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Match('/api/*')
    class TestFilter {
      match(result, ctx) {
        return result + ', midway';
      }
    }

    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runResultFilter('hello world', {path: '/api/123'} as any);

    expect(result).toEqual('hello world, midway');
    expect(error).toBeUndefined();
  });

  it('should test match multi-path', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Match([
      '/api/*',
      '/test/bdc/*'
    ])
    class TestFilter {
      match(result, ctx) {
        return result + ', midway';
      }
    }

    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runResultFilter('hello world', {path: '/test/bdc/123'} as any);

    expect(result).toEqual('hello world, midway');
    expect(error).toBeUndefined();
  });

  it('should test match fn', async () => {
    const container = new MidwayContainer();
    const filterManager = new FilterManager();

    @Match((ctx) => {
      return ctx.path.indexOf('bdc') !== -1;
    })
    class TestFilter {
      match(result, ctx) {
        return result + ', midway';
      }
    }

    container.bindClass(TestFilter);
    filterManager.useFilter(TestFilter);
    await filterManager.init(container);

    const { result, error } = await filterManager.runResultFilter('hello world', {path: '/test/bdc/123'} as any);

    expect(result).toEqual('hello world, midway');
    expect(error).toBeUndefined();
  });
});
