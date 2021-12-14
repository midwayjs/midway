import { Config, Middleware, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { resolve, extname } from 'path';
import { writeFileSync } from 'fs';
import { Readable, Stream } from 'stream';
import { UploadMode, UploadOptions } from '.';
import { parseFromWritableStream, parseMultipart } from './upload';
import * as getRawBody from 'raw-body';
import { ensureDirSync } from 'fs-extra';

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('upload')
  upload: UploadOptions;

  resolve(app) {
    const { mode, tmpdir, fileSize } = this.upload;
    ensureDirSync(tmpdir);
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      return async (req: any, res: any, next: any) => {
        return next();
      };
    } else {
      return async (ctx, next) => {
        const boundary = this.getUploadBoundary(ctx.request);
        if (!boundary) {
          return next();
        }
        ctx.fields = {};

        const req = ctx.request?.req || ctx.request;
        let body;
        if (this.isReadableStream(req)) {
          if (mode === UploadMode.Stream) {
            const { fields, fileInfo }: any = await parseFromWritableStream(
              req,
              boundary
            );
            ctx.fields = fields;
            ctx.files = [fileInfo];
            return next();
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
        ctx.files =
          mode === 'buffer'
            ? data.files
            : data.files.map((file, index) => {
                const { data, filename } = file;
                if (mode === UploadMode.File) {
                  const ext = extname(filename);
                  const tmpFileName = resolve(
                    tmpdir,
                    `${requireId}.${index}${ext}`
                  );
                  writeFileSync(tmpFileName, data, 'binary');
                  file.data = tmpFileName;
                } else if (mode === UploadMode.Stream) {
                  file.data = new Readable({
                    read() {
                      this.push(data);
                      this.push(null);
                    },
                  });
                }
                return file;
              });

        return next();
      };
    }
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

  isReadableStream(req: any): boolean {
    // ref: https://github.com/rvagg/isstream/blob/master/isstream.js#L10
    if (
      req instanceof Stream &&
      typeof (req as any)._read === 'function' &&
      typeof (req as any)._readableState === 'object' &&
      !(req as any).body
    ) {
      return true;
    }
    return false;
  }
}
