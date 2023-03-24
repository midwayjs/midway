import { httpError } from '@midwayjs/core';

export class MultipartInvalidFilenameError extends httpError.BadRequestError {
  constructor(filename: string) {
    super(`Invalid upload file name ${filename}, please check it`);
  }
}

export class MultipartInvalidFileTypeError extends httpError.BadRequestError {
  constructor(filename: string, type: string) {
    super(
      `Invalid upload file type, ${filename} type is not ${type} , please check it`
    );
  }
}
