import { MidwayError, registerErrorCode } from '@midwayjs/core';

const UPLOAD_ERROR_CODE = registerErrorCode('upload', {
  /**
   * upload invalid filename
   */
  INVALID_FILENAME: 10000,
} as const);

export class MultipartInvalidFilenameError extends MidwayError {
  constructor(filename: string) {
    super(
      `Invalid update file name ${filename}, please check it`,
      UPLOAD_ERROR_CODE.INVALID_FILENAME
    );
  }
}
