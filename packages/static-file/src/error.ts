import { registerErrorCode, MidwayError } from '@midwayjs/core';

export const StaticFileErrorEnum = registerErrorCode('static_file', {
  DIRECTORY_NOT_EXISTS: 10000,
} as const);

export class DirectoryNotFoundError extends MidwayError {
  constructor(p: string) {
    super(
      `Path ${p} not exist, please check it.`,
      StaticFileErrorEnum.DIRECTORY_NOT_EXISTS
    );
  }
}
