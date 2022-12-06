import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
  IMiddleware,
  IMidwayLogger,
} from '@midwayjs/core';
import { resolve, extname } from 'path';
import { promises } from 'fs';
import { Readable, Stream } from 'stream';
import {
  MultipartInvalidFilenameError,
  UploadFileInfo,
  UploadOptions,
} from '.';
import { parseFromReadableStream, parseMultipart } from './parse';
import * as getRawBody from 'raw-body';
const { unlink, writeFile } = promises;

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('upload')
  upload: UploadOptions;

  @Logger()
  logger: IMidwayLogger;

  private uploadWhiteListMap = {};

  resolve(app) {
    if (Array.isArray(this.upload.whitelist)) {
      for (const whiteExt of this.upload.whitelist) {
        this.uploadWhiteListMap[whiteExt] = true;
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
        const ext = this.checkExt(fileInfo.filename);
        if (!ext) {
          throw new MultipartInvalidFilenameError(fileInfo.filename);
        } else {
          fileInfo['_ext'] = ext as string;
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
    const notCheckFile = files.find(fileInfo => {
      const ext = this.checkExt(fileInfo.filename);
      if (!ext) {
        return fileInfo;
      }
      fileInfo['_ext'] = ext;
    });

    if (notCheckFile) {
      throw new MultipartInvalidFilenameError(notCheckFile.filename);
    }
    ctx.files = await Promise.all(
      files.map(async (file, index) => {
        const { data, filename } = file;
        if (mode === 'file') {
          const ext = file['_ext'] || extname(filename);
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

  checkExt(filename): string | boolean {
    const lowerCaseFileNameList = filename.toLowerCase().split('.');
    while (lowerCaseFileNameList.length) {
      lowerCaseFileNameList.shift();
      const curExt = `.${lowerCaseFileNameList.join('.')}`;
      if (this.upload.whitelist === null || this.uploadWhiteListMap[curExt]) {
        return curExt;
      }
    }
    return false;
  }

  static getName() {
    return 'upload';
  }
}
