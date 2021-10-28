import { MidwayAspectService, MidwayContainer, MidwayDecoratorService } from '../../src';
import { createCustomMethodDecorator, JoinPoint, Provide } from '@midwayjs/decorator';

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
    console.log(await a.invokeAsyncMethod());
  });

});
