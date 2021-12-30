import { Config, Configuration, Inject } from '@midwayjs/decorator';
import * as DefaultConfig from './config/config.default';
import { MidwayApplicationManager } from '@midwayjs/core';
import { UploadMiddleware } from './middleware';
import {
  autoRemoveUploadTmpFile,
  ensureDir,
  stopAutoRemoveUploadTmpFile,
} from './utils';
import { UploadOptions } from './interface';
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
  uploadConfig: UploadOptions;

  async onReady() {
    const { tmpdir, cleanTimeout } = this.uploadConfig;
    if (tmpdir) {
      await ensureDir(tmpdir);
      if (cleanTimeout) {
        autoRemoveUploadTmpFile(tmpdir, cleanTimeout);
      }
    }
    this.applicationManager
      .getApplications(['koa', 'faas', 'express', 'egg'])
      .forEach(app => {
        app.useMiddleware(UploadMiddleware);
      });
  }

  async onStop() {
    await stopAutoRemoveUploadTmpFile();
  }
}
