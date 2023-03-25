import { Readable } from "stream";

export type UploadMode = 'stream' | 'file';
type PathConditionFunctoin = (path: string) => boolean;
type PathCondition = RegExp | PathConditionFunctoin;

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
  whitelist?: string[] | null;
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
  ignore?:  PathCondition;
  /**
   * Match those paths with higher priority than ignore
   */
  match?: PathCondition;
  fileTypeWhiteList?: string[][] | null;
}



export interface UploadFileInfo<T> {
  filename: string;
  fieldName: string;
  mimeType: string;
  data: T extends string ? string : Readable ;
}
