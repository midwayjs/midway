import { extname } from 'path';
import { readFileSync } from 'fs';

export const PathFileUtil = {
  isPath(p): boolean {
    // eslint-disable-next-line no-useless-escape
    if (/(^[\.\/])|:|\\/.test(p)) {
      return true;
    }
    return false;
  },

  isPathEqual(one: string, two: string) {
    if (!one || !two) {
      return false;
    }
    const ext = extname(one);
    return one.replace(ext, '') === two;
  },

  getFileContentSync(filePath: any, encoding?: BufferEncoding) {
    return typeof filePath === 'string'
      ? readFileSync(filePath, {
          encoding,
        })
      : filePath;
  },
};
