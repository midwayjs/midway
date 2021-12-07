import { Configuration } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import * as koa from '@midwayjs/koa';
import * as orm from '@midwayjs/orm';

@Configuration({
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
  imports: [koa, orm],
})
export class MainConfiguration {
  async onReady() {}
}
