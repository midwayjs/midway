import { UploadMode, UploadOptions } from '../interface';
import { join } from 'path';
import { tmpdir } from 'os';
export const upload: UploadOptions = {
  mode: UploadMode.File,
  fileSize: '10mb',
  whitelist: null,
  tmpdir: join(tmpdir(), 'midway-upload-tmp'),
};
