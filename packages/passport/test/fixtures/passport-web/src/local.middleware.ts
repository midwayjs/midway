import { WebPassportMiddleware } from '../../../../src';
import { Provide } from '@midwayjs/decorator';

@Provide('local')
export class LocalPassportMiddleware extends WebPassportMiddleware {
  public strategy: string = 'local';

  public async auth(_ctx, _err, data) {
    return data;
  }
}

@Provide('local2')
export class LocalPassportMiddleware2 extends WebPassportMiddleware {
  public strategy: string = 'local2';

  public async auth(_ctx, _err, data) {
    return data;
  }
}
