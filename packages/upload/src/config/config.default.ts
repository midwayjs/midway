import { UploadMode, UploadOptions } from '../interface';
import { join } from 'path';
import { tmpdir } from 'os';
export const upload: UploadOptions = {
  mode: UploadMode.File,
  fileSize: '10mb',
  whitelist: [
    // images
    '.jpg',
    '.jpeg', // image/jpeg
    '.png', // image/png, image/x-png
    '.gif', // image/gif
    '.bmp', // image/bmp
    '.wbmp', // image/vnd.wap.wbmp
    '.webp',
    '.tif',
    '.psd',
    // text
    '.svg',
    '.js',
    '.jsx',
    '.json',
    '.css',
    '.less',
    '.html',
    '.htm',
    '.xml',
    '.pdf',
    // tar
    '.zip',
    '.gz',
    '.tgz',
    '.gzip',
    // video
    '.mp3',
    '.mp4',
    '.avi',
  ],
  tmpdir: join(tmpdir(), 'midway-upload-files'),
};
