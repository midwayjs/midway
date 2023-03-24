import { Readable } from "stream";

export type UploadMode = 'stream' | 'file';
type PathConditionFunctoin = (path: string) => boolean;
type PathCondition = RegExp | PathConditionFunctoin;

export interface UploadOptions {
  mode?: UploadMode,
  fileSize?: string;   // Max file size (in bytes), default is `10mb`
  whitelist?: string[] | null; // The white ext file names, default is `null`
  tmpdir?: string; // 临时文件目录
  cleanTimeout?: number; // 临时文件自动清理时间
  base64?: boolean; // 上传的body是否为base64，例如腾讯云的apigw
  ignore?:  PathCondition; // 忽略哪些路径
  match?: PathCondition; // 匹配那些路径，优先级高于 ignore
  fileTypeList?: [`.${string}`, string][] | null;
}



export interface UploadFileInfo<T> {
  filename: string;
  fieldName: string;
  mimeType: string;
  data: T extends string ? string : Readable ;
}
