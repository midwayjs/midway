import { httpError } from '@midwayjs/core';

export class MultipartInvalidFilenameError extends httpError.BadRequestError {
  constructor(filename: string) {
    super(`Invalid upload file name ${filename}, please check it`);
  }
}
