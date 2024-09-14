import { Readable } from 'stream';
import { IgnoreMatcher, IMidwayContext } from '@midwayjs/core';
import { BusboyConfig } from 'busboy';

export type UploadMode = 'stream' | 'file' | 'asyncIterator';

export interface UploadOptions extends BusboyConfig {
  /**
   * Upload mode, default is `file`
   */
  mode?: UploadMode,
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
}

export interface UploadFileInfo {
  /**
   * File name
   */
  filename: string;
  /**
   * file mime type
   */
  mimeType: string;
  /**
   * file data, a string of path
   */
  data: string;
  /**
   * field name
   */
  fieldName: string;
}

export interface UploadStreamFileInfo {
  /**
   * File name
   */
  filename: string;
  /**
   * file mime type
   */
  mimeType: string;
  /**
   * file data, Readable stream
   */
  data: Readable;
  /**
   * field name
   */
  fieldName: string;
}

export interface UploadStreamFieldInfo {
  /**
   * field name
   */
  name: string;
  /**
   * field value
   */
  value: any;
}

