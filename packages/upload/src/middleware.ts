import {
  Config,
  Logger,
  Middleware,
  MidwayFrameworkType,
} from '@midwayjs/decorator';
import { IMiddleware, IMidwayLogger } from '@midwayjs/core';
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

  resolve(app) {
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
        if (!this.checkExt(fileInfo.filename)) {
          throw new MultipartInvalidFilenameError(fileInfo.filename);
        } else {
          ctx.fields = fields;
          ctx.files = [fileInfo];
          return next();
        }
      }
      body = await getRawBody(req, {
        limit: fileSize,
      });
    } else {
      body = req.body;
    }

    const data = await parseMultipart(body, boundary);
    if (!data) {
      return next();
    }

    ctx.fields = data.fields;
    const requireId = `upload_${Date.now()}.${Math.random()}`;
    const files = data.files;
    const notCheckFile = files.find(fileInfo => {
      if (!this.checkExt(fileInfo.filename)) {
        return fileInfo;
      }
    });

    if (notCheckFile) {
      throw new MultipartInvalidFilenameError(notCheckFile.filename);
    }
    ctx.files = await Promise.all(
      files.map(async (file, index) => {
        const { data, filename } = file;
        if (mode === 'file') {
          const ext = extname(filename);
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
    if (!request.headers?.['content-type'] || method !== 'POST') {
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

  checkExt(filename): boolean {
    const ext = extname(filename).toLowerCase();
    const { whitelist } = this.upload;
    if (!Array.isArray(whitelist)) {
      return true;
    }
    return whitelist.includes(ext);
  }

  static getName() {
    return 'upload';
  }
}
