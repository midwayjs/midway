import {
  MidwayAspectService,
  MidwayContainer,
  MidwayDecoratorService,
  createCustomMethodDecorator,
  createCustomParamDecorator,
  JoinPoint,
  Provide,
  Pipe,
  PipeTransform
} from '../../src';

describe('/test/service/decoratorService.test.ts', () => {

  it('method decorator change method return value should be ok', async () => {

    function CustomMethod(name: string) {
      return createCustomMethodDecorator('aabbcc', {
        name
      });
    }

    function CustomMethod2(name: string) {
      return createCustomMethodDecorator('aabbccdd', {
        name
      });
    }

    @Provide()
    class A {
      @CustomMethod('abc')
      @CustomMethod('def')
      @CustomMethod2('ghi')
      async invokeAsyncMethod() {
        return 'hello world';
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    await container.getAsync(MidwayAspectService, [
      container
    ]);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    container.bindClass(A);

    decoratorService.registerMethodHandler('aabbcc', (options) => {

      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + options.metadata.name;
        }
      };
    });

    decoratorService.registerMethodHandler('aabbccdd', (options) => {
      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + options.metadata.name;
        }
      };
    });

    const a = await container.getAsync(A);
    expect(await a.invokeAsyncMethod()).toEqual('hello world ghi def abc');
  });

  it('parameter decorator change method return value should be ok', async () => {

    function CustomMethod(name: string) {
      return createCustomMethodDecorator('aabbcc', {
        name
      });
    }

    function CustomParam1(name: string) {
      return createCustomParamDecorator('ggg', {
        name
      });
    }

    function CustomParam2(name: string) {
      return createCustomParamDecorator('fff', {
        name
      });
    }

    @Provide()
    class A {
      @CustomMethod('abc')
      @CustomMethod('def')
      async invokeAsyncMethod(@CustomParam1('haha') @CustomParam2('gaga') name: string, @CustomParam1('hehe') bbb) {
        return 'hello world ' + name + ' ' + bbb;
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    await container.getAsync(MidwayAspectService, [
      container
    ]);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    container.bindClass(A);

    decoratorService.registerMethodHandler('aabbcc', (options) => {
      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + options.metadata.name;
        }
      };
    });

    decoratorService.registerParameterHandler('ggg', (options) => {
      return options.metadata.name;
    });

    decoratorService.registerParameterHandler('fff', (options) => {
      return options.metadata.name;
    });

    const a = await container.getAsync(A);
    expect(await a.invokeAsyncMethod.call(a, 'zhangting')).toEqual('hello world haha hehe def abc');
  });

  it('test parameter decorator and not register impl', async () => {
    function CustomParam1(name: string) {
      return createCustomParamDecorator('ggg', {
        name
      });
    }

    @Provide()
    class A {
      async invokeAsyncMethod(@CustomParam1('haha')name: string) {
        return 'hello world ' + name;
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    container.bindClass(A);

    const a = await container.getAsync(A);

    let error;
    try {
      await a.invokeAsyncMethod('bb');
    } catch (e) {
      error = e;
    }
    expect(error.message).toMatch('please register first');
  });

  it('test parameter decorator and throw error in implementation will be ignore', async () => {
    function CustomParam1(name: string) {
      return createCustomParamDecorator('ggg', {
        name
      });
    }

    @Provide()
    class A {
      async invokeAsyncMethod(@CustomParam1('haha')name: string) {
        return 'hello world ' + name;
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    decoratorService.registerParameterHandler('ggg', (options) => {
      throw new Error('test error');
    });

    container.bindClass(A);

    const a = await container.getAsync(A);

    let error;
    let result;
    try {
      result = await a.invokeAsyncMethod('bb');
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
    expect(result).toBe('hello world bb');
  });

  it('test parameter decorator and throw error when set throwError options true', async () => {
    function CustomParam1(name: string) {
      return createCustomParamDecorator('ggg', {
        name
      }, {
        throwError: true
      });
    }

    @Provide()
    class A {
      async invokeAsyncMethod(@CustomParam1('haha')name: string) {
        return 'hello world ' + name;
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    decoratorService.registerParameterHandler('ggg', (options) => {
      throw new Error('test error');
    });

    container.bindClass(A);

    const a = await container.getAsync(A);

    let error;
    try {
      await a.invokeAsyncMethod('bb');
    } catch (e) {
      error = e;
    }
    expect(error.message).toMatch('test error');
  });

  it('should test parameter and method decorator sequence', async () => {

    function CustomMethod(name: string) {
      return createCustomMethodDecorator('aabbcc', {
        name
      });
    }

    function CustomParam1(name) {
      return createCustomParamDecorator('ggg', {
        name
      });
    }


    @Provide()
    class A {
      @CustomMethod('111')
      async invokeAsyncMethod(@CustomParam1('222') bbb) {
        return bbb;
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    await container.getAsync(MidwayAspectService, [
      container
    ]);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    container.bindClass(A);

    decoratorService.registerMethodHandler('aabbcc', (options) => {
      return {
        before: (joinPoint: JoinPoint) => {
          joinPoint.args[0] = joinPoint.args[0] + options.metadata.name;
        },
      };
    });

    decoratorService.registerParameterHandler('ggg', (options) => {
      return options.metadata.name;
    });

    const a = await container.getAsync(A);
    expect(await a.invokeAsyncMethod(222)).toEqual('222111');
  });

  it('fix #1610 when method invoked', async () => {
    function CustomParam(name: string) {
      return createCustomParamDecorator('ggg', {
        name
      });
    }

    @Provide()
    class A {
      async invokeAsyncMethod(@CustomParam('haha') name: string) {
        return 'hello world ' + name;
      }

      async runTest() {
        return this.invokeAsyncMethod('bbb');
      }
    }

    const container = new MidwayContainer();
    container.bindClass(MidwayAspectService);
    container.bindClass(MidwayDecoratorService);

    await container.getAsync(MidwayAspectService, [
      container
    ]);

    const decoratorService = await container.getAsync(MidwayDecoratorService, [
      container
    ]);

    container.bindClass(A);
    const ctx = undefined;
    decoratorService.registerParameterHandler('ggg', (options) => {
      return ctx[options.metadata.name];
    });

    const a = await container.getAsync(A);
    expect(await a.runTest()).toEqual('hello world bbb');
  });

  describe('test pipe for parameter decorator', () => {
    it('should test parameter decorator add pipe', async () => {
      function CustomParam(name: string, pipes: any[]) {
        return createCustomParamDecorator('CustomParam', {
          name,
        }, {
          pipes
        });
      }

      @Pipe()
      class TestPipe implements PipeTransform {
        private prefix = 'midway ';

        transform(value: string, options) {
          return this.prefix + value + ' pipe';
        }
      }

      class TestPipe2 implements PipeTransform {
        transform(value: string) {
          return value + ' pipe2';
        }
      }

      const testPipe3 = (value) => {
        return value + ' pipe3';
      };

      @Provide()
      class A {
        async invoke(@CustomParam('haha', [TestPipe, new TestPipe2(), testPipe3]) name: string) {
          return 'hello world ' + name;
        }

        async invokeError(@CustomParam('haha', [{}]) name: string) {
          return 'hello world ' + name;
        }
      }

      const container = new MidwayContainer();
      container.bindClass(MidwayAspectService);
      container.bindClass(MidwayDecoratorService);

      const decoratorService = await container.getAsync(MidwayDecoratorService, [
        container
      ]);

      container.bindClass(TestPipe);
      container.bindClass(A);

      decoratorService.registerParameterHandler('CustomParam', (options) => {
        return options.metadata.name;
      });

      const a = await container.getAsync(A);
      expect(await a.invoke('bbb')).toEqual('hello world midway haha pipe pipe2 pipe3');

      let error;
      try {
        await a.invokeError('bb');
      } catch (e) {
        error = e;
      }
      expect(error.message).toMatch('Pipe must be a function or implement PipeTransform interface');
    });

    it('should test pipe reverse registration', async () => {
      function CustomParam(name: string) {
        return createCustomParamDecorator('CustomParam', {
          name,
        });
      }

      @Pipe()
      class TestPipe implements PipeTransform {
        private prefix = 'midway ';

        transform(value: string) {
          return this.prefix + value + ' pipe';
        }
      }

      @Provide()
      class A {
        async invoke(@CustomParam('haha') name: string) {
          return 'hello world ' + name;
        }
      }

      const container = new MidwayContainer();
      container.bindClass(MidwayAspectService);
      container.bindClass(MidwayDecoratorService);

      const decoratorService = await container.getAsync(MidwayDecoratorService, [
        container
      ]);

      container.bindClass(TestPipe);
      container.bindClass(A);

      decoratorService.registerParameterHandler('CustomParam', (options) => {
        return options.metadata.name;
      });

      decoratorService.registerParameterPipes('CustomParam', [TestPipe]);

      const a = await container.getAsync(A);
      expect(await a.invoke('bbb')).toEqual('hello world midway haha pipe');
    });
  });
});
