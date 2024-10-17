import { promises, constants } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
const { readdir, access, stat, unlink, mkdir } = promises;
let autoRemoveUploadTmpFileTimeoutHandler;
let autoRemoveUploadTmpFilePromise;
export const autoRemoveUploadTmpFile = async (
  tmpDir: string,
  cleanTimeout: number
) => {
  clearTimeout(autoRemoveUploadTmpFileTimeoutHandler);
  let waitTime = cleanTimeout / 3;
  if (waitTime < 1000) {
    waitTime = 1000;
  }

  if (autoRemoveUploadTmpFilePromise) {
    const exists = await checkExists(tmpDir);
    if (exists) {
      const paths = await readdir(tmpDir);
      const now = Date.now();
      await Promise.all(
        paths.map(async path => {
          const filePath = join(tmpDir, path);
          try {
            const statInfo = await stat(filePath);
            if (statInfo.isFile() && now - statInfo.ctimeMs > cleanTimeout) {
              await unlink(filePath);
            }
          } catch {
            return false;
          }
        })
      );
    }
  }

  autoRemoveUploadTmpFileTimeoutHandler = setTimeout(() => {
    autoRemoveUploadTmpFilePromise = autoRemoveUploadTmpFile(
      tmpDir,
      cleanTimeout
    );
  }, waitTime);
};

export const stopAutoRemoveUploadTmpFile = async () => {
  if (autoRemoveUploadTmpFilePromise) {
    await autoRemoveUploadTmpFilePromise;
    autoRemoveUploadTmpFilePromise = null;
  }
  clearTimeout(autoRemoveUploadTmpFileTimeoutHandler);
};

export const checkExists = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.W_OK | constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

export const ensureDir = async (dirPath: string): Promise<boolean> => {
  const isExists = await checkExists(dirPath);
  if (isExists) {
    return true;
  }
  try {
    await mkdir(dirPath, { recursive: true });
    return true;
  } catch {
    return false;
  }
};

export const formatExt = (ext: string): string => {
  return Buffer.from(ext.toLowerCase())
    .filter(ext => {
      // .
      if (ext === 0x2e) {
        return true;
      }
      // 0-9
      if (ext >= 0x30 && ext <= 0x39) {
        return true;
      }
      // a-z
      if (ext >= 0x61 && ext <= 0x7a) {
        return true;
      }
      return false;
    })
    .toString();
};

export async function* streamToAsyncIterator(
  stream: Readable
): AsyncGenerator<any> {
  for await (const chunk of stream) {
    yield chunk;
  }
}
