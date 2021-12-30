import { promises, constants } from 'fs';
import { join } from 'path';
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
