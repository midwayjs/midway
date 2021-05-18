/* eslint-disable node/no-extraneous-import */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { join } from 'path';

import { App, Config, Configuration } from '@midwayjs/decorator';
import { Application } from '@midwayjs/web';
import { JaegerTracer } from 'jaeger-client';

import { initTracer } from './lib/tracer';
import { TracerConfig } from './lib/types';

@Configuration({
  namespace: 'jaeger',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  @App() readonly app: Application;

  @Config('tracer') readonly tracerConfig: TracerConfig;

  private tracer: JaegerTracer;

  async onReady(): Promise<void> {
    const { middleWareName } = this.tracerConfig;
    if (middleWareName) {
      /**
       * - 应于 error-handler.middleware 之后，由其对 ctx._internalError 进行赋值
       * - 应于 request-id.middleware 之后，由其对 ctx.reqId 进行赋值
       * - 应于 其它中间件（包括 body-parse）之前，以便追踪覆盖更大范围
       */
      this.app.config.coreMiddleware.unshift(middleWareName);
    }
    this.tracer = initTracer(this.app);
  }

  async onStop(): Promise<void> {
    this.tracer.close();
  }
}
