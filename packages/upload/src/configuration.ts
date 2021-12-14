import { Config, Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { MidwayApplicationManager } from '@midwayjs/core';
import { UploadMiddleware } from './middleware';
import { ensureDir } from 'fs-extra';
@Configuration({
  namespace: 'upload',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class UploadConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Config('upload')
  uploadConfig;

  async onReady() {
    const { tmpdir } = this.uploadConfig;
    if (tmpdir) {
      await ensureDir(tmpdir);
    }
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(UploadMiddleware);
      });
  }
}
