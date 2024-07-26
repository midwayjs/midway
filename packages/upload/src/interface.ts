import { Readable } from 'stream';
import { IgnoreMatcher, IMidwayContext } from '@midwayjs/core';

export type UploadMode = 'stream' | 'file';

export interface UploadOptions {
  /**
   * Upload mode, default is `file`
   */
  mode?: UploadMode,
  /**
   * Max file size (in bytes), default is `10mb`
   */
  fileSize?: string;
  /**
   * The white ext file names
   */
  whitelist?: string[] | null | ((ctx: IMidwayContext<any>) => string[]);
  /**
   * Temporary file directory
   */
  tmpdir?: string;
  /**
   * Temporary file automatic cleanup time, default is 5 minutes
   */
  cleanTimeout?: number;
  /**
   * Whether the uploaded body is base64, for example, apigw of Tencent Cloud
   */
  base64?: boolean;
  /**
   * Which paths to ignore
   */
  ignore?:  IgnoreMatcher<any> | IgnoreMatcher<any>[];
  /**
   * Match those paths with higher priority than ignore
   */
  match?: IgnoreMatcher<any> | IgnoreMatcher<any>[];
  /**
   * Mime type white list
   */
  mimeTypeWhiteList?: Record<string, string | string[]> | ((ctx: IMidwayContext<any>) => string | string[]);
  /**
   * Whether to allow fields duplication, default is `false`
   */
  allowFieldsDuplication?: boolean;
}



export interface UploadFileInfo<T> {
  filename: string;
  fieldName: string;
  mimeType: string;
  data: T extends string ? string : Readable ;
}
