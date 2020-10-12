import { Provide, Plugin } from '@midwayjs/decorator';

@Provide()
export class Report {

  @Plugin()
  custom;

  resolve() {
    return async (ctx, next) => {
      console.log(this.custom);
      await next();
    };
  }
}
