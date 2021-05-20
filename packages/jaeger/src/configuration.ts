/* eslint-disable node/no-extraneous-import */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { join } from 'path';

import { App, Config, Configuration } from '@midwayjs/decorator';
import { IMidwayWebApplication } from '@midwayjs/web';
import { JaegerTracer } from 'jaeger-client';

import { initTracer } from './lib/tracer';
import { TracerConfig } from './lib/types';
import { tracerMiddleware } from './middleware/tracer.middleware';

@Configuration({
  // namespace: 'jaeger', // 指定后会导致中间件无法正常加载!
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  @App() readonly app: IMidwayWebApplication;

  @Config('tracer') readonly tracerConfig: TracerConfig;

  private tracer: JaegerTracer;

  async onReady(): Promise<void> {
    this.tracer = initTracer(this.app);
    registerMiddleware(this.app, this.tracerConfig);
  }

  async onStop(): Promise<void> {
    this.tracer.close();
  }
}

export function registerMiddleware(
  app: IMidwayWebApplication,
  tracerConfig: TracerConfig
): void {
  const { enableMiddleWare } = tracerConfig;
  if (!enableMiddleWare) {
    return;
  }

  const appMiddleware = app.getConfig('middleware') as string[];
  if (Array.isArray(appMiddleware)) {
    appMiddleware.push('tracerExtMiddleware');
  } else {
    throw new TypeError('appMiddleware is not valid Array');
  }

  /**
   * 应于所有中间件之前，以便追踪覆盖更大范围
   */
  app.use(tracerMiddleware);
}
