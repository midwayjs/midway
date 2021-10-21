import { App, Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMidwayApplication } from '../../../../src';
import { TestFilter, TestFilter2 } from './filter/testFilter';

@Configuration()
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;

  async onReady() {
    this.app.useMiddleware([TestFilter]);
    this.app.getMiddleware().insertBefore(0, TestFilter2);
    this.app.getMiddleware().insertBefore('name', TestFilter2);
  }

  onAppError(err, app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.LIGHT) {
      this.app.getLogger().error(err.message);
    }
  }

  // onContextError(err, ctx, app: IMidwayApplication) {
  //
  // }
}

//
// @GlobalCatch(A, B, C)
// class AllExceptionFilter {
//   catchException(error,ctx) {
//     return {
//       data: xxx
//     }
//   }
// }
//
//
//
// @Get()
// async getUser() {
//   throe new A()
// }
//
// this.app.addFilter(AllExceptionFilter)
