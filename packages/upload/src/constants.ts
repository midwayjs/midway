export const uploadWhiteList = [
  // images
  '.jpg',
  '.jpeg', // image/jpeg
  '.png', // image/png, image/x-png
  '.gif', // image/gif
  '.bmp', // image/bmp
  '.wbmp', // image/vnd.wap.wbmp
  '.webp',
  '.tif',
  '.tiff',
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
];

// https://mimetype.io/
export const DefaultUploadFileMimeType = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.wbmp': 'image/vnd.wap.wbmp',
  '.webp': 'image/webp',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.psd': 'image/vnd.adobe.photoshop',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.gzip': 'application/gzip',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.avi': 'video/x-msvideo',
};

export const EXT_KEY = Symbol('_ext');
