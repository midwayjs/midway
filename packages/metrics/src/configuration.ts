// src/configuration.ts
import { Config, Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as PromClient from 'prom-client';

@Configuration({
  namespace: 'metrics',
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {
  @Config('metrics')
  metrics: any;

  async onReady(contanier) {
    PromClient.collectDefaultMetrics(this.metrics);
  }
}
