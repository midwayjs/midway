import { IApplicationContext, ScopeEnum } from '../../src';
import { Provide, Scope, Init } from '@midwayjs/decorator';

export function testInjectFunction(context: IApplicationContext) {
  const child: any = context.get('childFn');
  return child.a + child.b;
}

export function childFunction() {
  return {
    a: 1,
    b: 2
  };
}

export async function testInjectAsyncFunction(context: IApplicationContext) {
  const child: any = await context.getAsync('childAsync');
  return child.c + child.d;
}

export async function childAsyncFunction(context: IApplicationContext) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        c: 3,
        d: 4
      });
    }, 10);
  });
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class AliSingleton {
  getInstance() {
    return 'alisingleton';
  }

  @Init()
  async test() {
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  }
}

export async function singletonFactory(context: IApplicationContext) {
  const inst = await context.getAsync(AliSingleton);
  return inst.getInstance();
}

export async function singletonFactory2(context: IApplicationContext) {
  return async () => {
    const inst = await context.getAsync<AliSingleton>('aliSingleton');
    return inst.getInstance();
  };
}
