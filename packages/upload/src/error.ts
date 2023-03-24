import { httpError } from '@midwayjs/core';

export class MultipartInvalidFilenameError extends httpError.BadRequestError {
  constructor(filename: string) {
    super(`Invalid upload file name ${filename}, please check it`);
  }
}

export class MultipartInvalidFileTypeError extends httpError.BadRequestError {
  constructor(filename: string, currentType: string, type: string) {
    super(
      `Invalid upload file type, ${filename} type(${
        currentType || 'unknown'
      }) is not ${type} , please check it`
    );
  }
}
