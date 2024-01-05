import {
  Config,
  Logger,
  Middleware,
  Init,
  MidwayFrameworkType,
  IMiddleware,
  ILogger,
  IgnoreMatcher,
} from '@midwayjs/core';
import { resolve } from 'path';
import { promises } from 'fs';
import { Readable, Stream } from 'stream';
import {
  EXT_KEY,
  MimeTypeCheckerHandler,
  MultipartInvalidFilenameError,
  MultipartInvalidFileTypeError,
  UploadFileInfo,
  UploadOptions,
  WhitelistCheckerHandler,
} from '.';
import { parseFromReadableStream, parseMultipart } from './parse';
import * as getRawBody from 'raw-body';
import { fromBuffer } from 'file-type';
import { formatExt } from './utils';

const { unlink, writeFile } = promises;

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('upload')
  uploadConfig: UploadOptions;

  @Logger()
  logger: ILogger;

  private extWhiteListChecker: WhitelistCheckerHandler;
  private mimeTypeChecker: MimeTypeCheckerHandler;
  match: IgnoreMatcher<any>[];
  ignore: IgnoreMatcher<any>[];

  @Init()
  async init() {
    if (this.uploadConfig.match) {
      this.match = [].concat(this.uploadConfig.match || []);
    } else {
      this.ignore = [].concat(this.uploadConfig.ignore || []);
    }

    // init ext white list checker
    this.extWhiteListChecker = (reqOrCtx, ext) => {
      if (this.uploadConfig.whitelist === null) {
        const newExt = formatExt(ext);
        return [!!newExt, newExt];
      }

      const newPattern =
        typeof this.uploadConfig.whitelist === 'function'
          ? this.uploadConfig.whitelist(reqOrCtx)
          : this.uploadConfig.whitelist;
      return newPattern.includes(ext) ? [true, ext] : [false];
    };

    // init mime type checker
    this.mimeTypeChecker = (reqOrCtx: string, ext: string) => {
      if (this.uploadConfig.mimeTypeWhiteList) {
        const newPattern =
          typeof this.uploadConfig.mimeTypeWhiteList === 'function'
            ? this.uploadConfig.mimeTypeWhiteList(reqOrCtx)
            : this.uploadConfig.mimeTypeWhiteList;
        const whiteList = newPattern[ext];
        if (whiteList) {
          return [true, whiteList];
        } else {
          return [false];
        }
      } else {
        return [true, ext];
      }
    };
  }

  resolve(app) {
    // if (this.uploadConfig.mimeTypeWhiteList) {
    //   for (const ext in this.uploadConfig.mimeTypeWhiteList) {
    //     const mime = [].concat(this.uploadConfig.mimeTypeWhiteList[ext]);
    //     this.mimeTypeChecker.set(ext, mime);
    //   }
    // }
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
    const { mode, tmpdir, fileSize } = this.uploadConfig;
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
        const [isPassed, ext] = this.checkAndGetExt(
          isExpress ? req : ctx,
          fileInfo.filename
        );
        if (!isPassed) {
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

    const data = await parseMultipart(body, boundary, this.uploadConfig);
    if (!data) {
      return next();
    }

    ctx.fields = data.fields;
    const requireId = `upload_${Date.now()}.${Math.random()}`;
    const files = data.files;
    for (const fileInfo of files) {
      const [isPassed, ext] = this.checkAndGetExt(
        isExpress ? req : ctx,
        fileInfo.filename
      );
      if (!isPassed) {
        throw new MultipartInvalidFilenameError(fileInfo.filename);
      }
      const [passed, expectMime, actualMine] = await this.checkFileType(
        isExpress ? req : ctx,
        ext,
        fileInfo.data
      );
      if (!passed) {
        throw new MultipartInvalidFileTypeError(
          fileInfo.filename,
          actualMine,
          expectMime
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
  private checkAndGetExt(reqOrCtx, filename): [boolean, string?] {
    const lowerCaseFileNameList = filename.toLowerCase().split('.');
    while (lowerCaseFileNameList.length) {
      lowerCaseFileNameList.shift();
      const curExt = `.${lowerCaseFileNameList.join('.')}`;
      return this.extWhiteListChecker(reqOrCtx, curExt);
    }
    return [false];
  }

  // check file-type
  async checkFileType(
    reqOrCtx,
    ext: string,
    data: Buffer
  ): Promise<[boolean, string, string?]> {
    const [isPassed, mime] = this.mimeTypeChecker(reqOrCtx, ext);
    if (isPassed && this.uploadConfig.mimeTypeWhiteList) {
      const mimeArr = [].concat(mime);
      // 检查二进制中实际 mime 和请求中的是否匹配
      const typeInfo = await fromBuffer(data);
      if (!typeInfo) {
        return [false, mimeArr.join('、')];
      }

      const findMime = mimeArr.find(mimeItem => mimeItem === typeInfo.mime);
      return [!!findMime, mimeArr.join('、'), typeInfo.mime];
    }
    return [isPassed, Array.isArray(mime) ? mime.join('、') : mime];
  }

  static getName() {
    return 'upload';
  }
}
