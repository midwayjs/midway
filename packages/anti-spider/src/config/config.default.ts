import { UploadOptions } from '../interface';
import { join } from 'path';
import { tmpdir } from 'os';
import { uploadWhiteList } from '../constants';

export const upload: UploadOptions = {
  mode: 'file',
  fileSize: '10mb',
  whitelist: uploadWhiteList,
  tmpdir: join(tmpdir(), 'midway-upload-files'),
  cleanTimeout: 5 * 60 * 1000,
};
