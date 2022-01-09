import { hooks, createConfiguration } from '@midwayjs/hooks';
import bodyParser from 'koa-bodyparser';

export default createConfiguration({
  imports: [
    hooks({
      middleware: [bodyParser()],
    }),
  ],
});
