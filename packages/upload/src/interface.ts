import { Readable } from "stream";

export enum UploadMode {
  Stream = 'stream',
  File = 'file',
  Buffer = 'buffer',
}
export interface UploadOptions {
  mode?: UploadMode,
  fileSize?: string;   // Max file size (in bytes), default is `10mb`
  whitelist?: string[]; // The white ext file names, default is `null`
  tmpdir?: string; // 临时文件目录
  // autoFields: false, // Auto set fields to parts, default is `false`. Only work on `stream` mode.
  // fieldNameSize: number; // Max field name size (in bytes), default is `100`
  // fieldSize: string;  // Max field value size (in bytes), default is `100kb`
  // fields: number;     // Max number of non-file fields, default is `10`
  // files: number;      // Max number of file fields, default is `10`
  // fileExtensions: [],
  // allowArrayField: false,
}


export interface UploadFileInfo {
  filename: string;
  fieldname: string;
  mimeType: string;
  data: Buffer | Readable | string;
}