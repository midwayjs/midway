import { getMethodParamTypes, Get } from '../src';

describe('/test/decoratorManager.test.ts', () => {

  it('should test', function () {
    const obj = {ccc: 'd'}
    class D {}
    class A {
      @Get()
      async invoke(a: number, b: string, c: boolean, d: D, e: [], f: Map<string, any>, g: Set<any>) {}

      @Get()
      async invoke2(a: Record<any, any>, b: unknown, c: any, d: typeof obj) {}
    }
    const paramTypes = getMethodParamTypes(A, 'invoke');
    expect(paramTypes.length).toEqual(7);

    const paramTypes2 = getMethodParamTypes(A, 'invoke2');
    expect(paramTypes2.length).toEqual(4);
  });
});
