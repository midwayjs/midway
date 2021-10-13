import { App, Configuration, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMidwayApplication } from '../../../../src';
import { TestFilter, TestFilter2 } from './filter/testFilter';

@Configuration()
export class AutoConfiguration {

  @App()
  app: IMidwayApplication;

  async onReady() {
    this.app.addGlobalFilter([TestFilter]);
    this.app.getGlobalFilter().insertBefore(0, TestFilter2);
  }

  onAppError(err, app: IMidwayApplication) {
    if (app.getFrameworkType() === MidwayFrameworkType.LIGHT) {
      this.app.getLogger().error(err.message);
    }
  }
  //
  // onContextError(err, ctx, app: IMidwayApplication) {
  //
  // }
}

//
// @Catch(HttpNotFoundException)
// class AllExceptionFilter {
//   catchException(ctx) {
//     ctx.body = {
//
//     }
//   }
// }
