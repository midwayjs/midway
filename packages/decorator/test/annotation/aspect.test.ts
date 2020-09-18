import { Aspect, ASPECT_KEY, IMethodAspect, JoinPoint, listModule } from '../../src';

describe('/test/annotation/aspect.test.ts', () => {
  it('test inspect key in module', () => {
    class MyAspect implements IMethodAspect {
      around(point: JoinPoint): any {
        point.proceed();
      }
    }

    @Aspect(MyAspect)
    class MyAspectClass {
      async hello() {}
    }

    const myAspect = new MyAspectClass();
    myAspect.hello();

    const modules = listModule(ASPECT_KEY);
    expect(modules[0].name).toEqual('MyAspectClass');
  });
});
