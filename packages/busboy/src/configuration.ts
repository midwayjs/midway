import {
  Config,
  Configuration,
  ILogger,
  Inject,
  Logger,
  MidwayApplicationManager,
} from '@midwayjs/core';
import * as DefaultConfig from './config/config.default';
import {
  autoRemoveUploadTmpFile,
  ensureDir,
  stopAutoRemoveUploadTmpFile,
} from './utils';
import { UploadOptions } from './interface';
@Configuration({
  namespace: 'busboy',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BusboyConfiguration {
  @Inject()
  applicationManager: MidwayApplicationManager;

  @Config('upload')
  uploadConfig: UploadOptions;

  @Logger('coreLogger')
  logger: ILogger;

  async onReady() {
    const { tmpdir, cleanTimeout } = this.uploadConfig;
    if (tmpdir) {
      await ensureDir(tmpdir);
      if (cleanTimeout) {
        autoRemoveUploadTmpFile(tmpdir, cleanTimeout).catch(err => {
          this.logger.error(err);
        });
      }
    }
  }

  async onStop() {
    await stopAutoRemoveUploadTmpFile();
  }
}
