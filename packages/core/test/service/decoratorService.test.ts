import { MidwayAspectService, MidwayContainer, MidwayDecoratorService } from '../../src';
import { createCustomMethodDecorator, createCustomParamDecorator, JoinPoint, Provide } from '@midwayjs/decorator';

describe('/test/service/decoratorService.test.ts', () => {
  it('method decorator change method return value should be ok', async() => {

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

    decoratorService.registerMethodHandler('aabbcc', (target, method, metadata) => {

      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + metadata.name;
        }
      }
    });

    decoratorService.registerMethodHandler('aabbccdd', (target, method, metadata) => {
      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + metadata.name;
        }
      }
    });

    const a = await container.getAsync(A);
    expect(await a.invokeAsyncMethod()).toEqual('hello world ghi def abc');
  });

  it('parameter decorator change method return value should be ok', async() => {

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

    decoratorService.registerMethodHandler('aabbcc', (target, method, metadata) => {
      return {
        afterReturn: (joinPoint: JoinPoint, result: string) => {
          return result + ' ' + metadata.name;
        }
      }
    });

    decoratorService.registerParameterHandler('ggg', (target, method, metadata) => {
      return metadata.name;
    });

    decoratorService.registerParameterHandler('fff', (target, method, metadata) => {
      return metadata.name;
    });

    const a = await container.getAsync(A);
    expect(await a.invokeAsyncMethod.call(a, 'zhangting')).toEqual('hello world haha hehe def abc');
  });
});
