import { httpError } from '@midwayjs/core';

export class MultipartInvalidFilenameError extends httpError.BadRequestError {
  constructor(filename: string) {
    super(`Invalid upload file name "${filename}", please check it`);
  }
}

export class MultipartInvalidFileTypeError extends httpError.BadRequestError {
  constructor(filename: string, currentType: string, type: string) {
    super(
      `Invalid upload file type, "${filename}" type(${
        currentType || 'unknown'
      }) is not ${type} , please check it`
    );
  }
}

export class MultipartFileSizeLimitError extends httpError.BadRequestError {
  constructor(filename: string) {
    super(`Upload file "${filename}" size exceeds the limit`);
  }
}

export class MultipartError extends httpError.BadRequestError {
  constructor(err: Error) {
    super(err.message);
  }
}

export class MultipartFileLimitError extends httpError.BadRequestError {
  constructor() {
    super('Upload file count exceeds the limit');
  }
}

// partsLimit
export class MultipartPartsLimitError extends httpError.BadRequestError {
  constructor() {
    super('Upload parts count exceeds the limit');
  }
}

// fieldsLimit
export class MultipartFieldsLimitError extends httpError.BadRequestError {
  constructor() {
    super('Upload fields count exceeds the limit');
  }
}
