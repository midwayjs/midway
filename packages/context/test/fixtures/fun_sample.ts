import {IApplicationContext} from '../../src';

export function testInjectFunction(context: IApplicationContext) {
  const child: any = context.get('child');
  return child.a + child.b;
}

export function childFunction() {
  return {
    a: 1,
    b: 2
  };
}

// providerWrapper([
//   {
//     id: 'parentAsync',
//     provider: testInjectAsyncFunction
//   },
//   {
//     id: 'childAsync',
//     provider: childAsyncFunction
//   }
// ]);

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

// class AdapterFactory {
//
//   @inject()
//   factory: (context) => adapter;
//
//   async get(name) {
//     if(name === 'aone') {
//       return context.get('aoneAdapter');
//     } else if(name === 'labs') {
//       return context.get('labsAdapter');
//     }
//   }
// }
//
// export function(seq) {
//   return seq.define({
//
//   });
// }
