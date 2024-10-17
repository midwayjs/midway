import { Config, Configuration, ILogger, Logger } from '@midwayjs/core';
import {
  autoRemoveUploadTmpFile,
  ensureDir,
  stopAutoRemoveUploadTmpFile,
} from './utils';
import { UploadOptions } from './interface';
import { uploadWhiteList } from './constants';
import { join } from 'path';
import { tmpdir } from 'os';
@Configuration({
  namespace: 'busboy',
  importConfigs: [
    {
      default: {
        busboy: {
          mode: 'file',
          whitelist: uploadWhiteList,
          tmpdir: join(tmpdir(), 'midway-busboy-files'),
          cleanTimeout: 5 * 60 * 1000,
          base64: false,
        } as UploadOptions,
      },
    },
  ],
})
export class BusboyConfiguration {
  @Config('busboy')
  uploadConfig: UploadOptions;

  @Logger('coreLogger')
  logger: ILogger;

  async onReady() {
    const { tmpdir, cleanTimeout, mode } = this.uploadConfig;
    if (mode === 'file' && tmpdir) {
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
