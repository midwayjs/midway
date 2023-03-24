import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
  IMiddleware,
  IMidwayLogger,
} from '@midwayjs/core';
import { resolve } from 'path';
import { promises } from 'fs';
import { Readable, Stream } from 'stream';
import {
  EXT_KEY,
  MultipartInvalidFilenameError,
  MultipartInvalidFileTypeError,
  UploadFileInfo,
  UploadOptions,
} from '.';
import { parseFromReadableStream, parseMultipart } from './parse';
import * as getRawBody from 'raw-body';
import { fromBuffer } from 'file-type';
import { formatExt } from './utils';

const { unlink, writeFile } = promises;

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('upload')
  upload: UploadOptions;

  @Logger()
  logger: IMidwayLogger;

  private uploadWhiteListMap = new Map<string, string>();
  private uploadFileTypeMap = new Map<string, string[]>();

  resolve(app) {
    if (Array.isArray(this.upload.whitelist)) {
      for (const whiteExt of this.upload.whitelist) {
        this.uploadWhiteListMap.set(whiteExt, whiteExt);
      }
    }
    if (Array.isArray(this.upload.fileTypeWhiteList)) {
      for (const [ext, ...mime] of this.upload.fileTypeWhiteList) {
        this.uploadFileTypeMap.set(ext, mime);
      }
    }
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return this.execUpload(req, req, res, next, true);
      };
    } else {
      return async (ctx, next) => {
        const req = ctx.request?.req || ctx.request;
        return this.execUpload(ctx, req, ctx, next, false);
      };
    }
  }

  async execUpload(ctx, req, res, next, isExpress) {
    const { mode, tmpdir, fileSize } = this.upload;
    const passed = this.checkMatchOrIgnore(ctx.path);
    if (!passed) {
      return next();
    }
    const boundary = this.getUploadBoundary(req);
    if (!boundary) {
      return next();
    }
    ctx.fields = {};
    ctx.files = [];
    ctx.cleanupRequestFiles = async (): Promise<Array<boolean>> => {
      if (!ctx.files?.length) {
        return [];
      }
      return Promise.all(
        ctx.files.map(async (fileInfo: UploadFileInfo<any>) => {
          if (typeof fileInfo.data !== 'string') {
            return false;
          }
          try {
            await unlink(fileInfo.data);
            return true;
          } catch {
            return false;
          }
        })
      );
    };

    let body;
    if (this.isReadableStream(req, isExpress)) {
      if (mode === 'stream') {
        const { fields, fileInfo } = await parseFromReadableStream(
          req,
          boundary
        );
        const ext = this.checkAndGetExt(fileInfo.filename);
        if (!ext) {
          throw new MultipartInvalidFilenameError(fileInfo.filename);
        } else {
          fileInfo[EXT_KEY] = ext as string;
          ctx.fields = fields;
          ctx.files = [fileInfo];
          return next();
        }
      }
      body = await getRawBody(req, {
        limit: fileSize,
      });
    } else if (
      req?.originEvent?.body &&
      (typeof req.originEvent.body === 'string' ||
        Buffer.isBuffer(req.originEvent.body))
    ) {
      body = req.originEvent.body;
    } else {
      body = req.body;
    }

    const data = await parseMultipart(body, boundary, this.upload);
    if (!data) {
      return next();
    }

    ctx.fields = data.fields;
    const requireId = `upload_${Date.now()}.${Math.random()}`;
    const files = data.files;
    for (const fileInfo of files) {
      const ext = this.checkAndGetExt(fileInfo.filename);
      if (!ext) {
        throw new MultipartInvalidFilenameError(fileInfo.filename);
      }
      const { passed, mime, current } = await this.checkFileType(
        ext as string,
        fileInfo.data
      );
      if (!passed) {
        throw new MultipartInvalidFileTypeError(
          fileInfo.filename,
          current,
          mime
        );
      }

      fileInfo[EXT_KEY] = ext;
    }
    ctx.files = await Promise.all(
      files.map(async (file, index) => {
        const { data } = file;
        if (mode === 'file') {
          const ext = file[EXT_KEY];
          const tmpFileName = resolve(tmpdir, `${requireId}.${index}${ext}`);
          await writeFile(tmpFileName, data, 'binary');
          file.data = tmpFileName;
        } else if (mode === 'stream') {
          file.data = new Readable({
            read() {
              this.push(data);
              this.push(null);
            },
          });
        }
        return file;
      })
    );

    return next();
  }

  getUploadBoundary(request): false | string {
    const method = (request.method || request.httpMethod || '').toUpperCase();
    if (
      method !== 'POST' &&
      method !== 'PUT' &&
      method !== 'DELETE' &&
      method !== 'PATCH'
    ) {
      return false;
    }
    if (!request.headers?.['content-type']) {
      return false;
    }
    const contentType: string = request.headers['content-type'];
    if (!contentType.startsWith('multipart/form-data;')) {
      return false;
    }

    const boundaryMatch = /boundary=(.*)(;|\s|$)/.exec(contentType);
    if (!boundaryMatch?.[1]) {
      return false;
    }
    return boundaryMatch[1];
  }

  isReadableStream(req: any, isExpress): boolean {
    // ref: https://github.com/rvagg/isstream/blob/master/isstream.js#L10
    if (
      req instanceof Stream &&
      typeof (req as any)._read === 'function' &&
      typeof (req as any)._readableState === 'object' &&
      (!(req as any).body || isExpress)
    ) {
      return true;
    }
    if (req.pipe && req.on && !req.body) {
      return true;
    }
    return false;
  }

  // check extentions
  checkAndGetExt(filename): string | boolean {
    const lowerCaseFileNameList = filename.toLowerCase().split('.');
    while (lowerCaseFileNameList.length) {
      lowerCaseFileNameList.shift();
      const curExt = `.${lowerCaseFileNameList.join('.')}`;
      if (this.upload.whitelist === null) {
        return formatExt(curExt);
      }
      if (this.uploadWhiteListMap.has(curExt)) {
        // Avoid the presence of hidden characters and return extensions in the white list.
        return this.uploadWhiteListMap.get(curExt);
      }
    }
    return false;
  }

  // check file-type
  async checkFileType(
    ext: string,
    data: Buffer
  ): Promise<{ passed: boolean; mime?: string; current?: string }> {
    // fileType == null, pass check
    if (!this.upload.fileTypeWhiteList?.length) {
      return { passed: true };
    }

    const mime = this.uploadFileTypeMap.get(ext);
    if (!mime) {
      return { passed: false, mime: ext };
    }
    if (!mime.length) {
      return { passed: true };
    }
    const typeInfo = await fromBuffer(data);
    if (!typeInfo) {
      return { passed: false, mime: mime.join('、') };
    }
    const findMime = mime.find(mimeItem => mimeItem === typeInfo.mime);
    return {
      passed: !!findMime,
      mime: mime.join('、'),
      current: typeInfo.mime,
    };
  }

  static getName() {
    return 'upload';
  }

  checkMatchOrIgnore(path = ''): boolean {
    // if no matching rule, the default is passed, otherwise is not passed
    let passed = !this.upload.match;
    if (this.upload.ignore) {
      if (this.upload.ignore instanceof RegExp) {
        passed = !this.upload.ignore.test(path);
      } else if (typeof this.upload.ignore === 'function') {
        passed = !this.upload.ignore(path);
      }
    }
    if (this.upload.match) {
      if (this.upload.match instanceof RegExp) {
        passed = this.upload.match.test(path);
      } else if (typeof this.upload.match === 'function') {
        passed = this.upload.match(path);
      }
    }
    return passed;
  }
}
