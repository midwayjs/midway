import { Middleware } from '@midwayjs/decorator';
import { Context } from '../../../../../src';

@Middleware()
export class ConnectionMiddleware {

  resolve() {
    return async (ctx: Context, next) => {
      // ctx.emit('res', 'connected!');
      console.log('client connection, id = ' + ctx.id);
      await next();
      // execute when disconnect.
      console.log('disconnection!');
    }
  }
}
