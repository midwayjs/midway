import {Controller as BaseController} from 'egg';
import {inject} from 'injection';

export class Controller extends BaseController {

  ctx;
  app;
  config;

  constructor(@inject('ctx') ctx) {
    super(ctx);
  }

}
