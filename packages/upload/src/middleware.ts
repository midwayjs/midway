import { Config, Middleware, MidwayFrameworkType } from '@midwayjs/decorator';
import { IMiddleware } from '@midwayjs/core';
import { resolve, extname } from 'path';
import { writeFileSync } from 'fs';
import { Readable } from 'stream';
import { UploadMode, UploadOptions } from '.';
import { parseMultipart } from './upload';
import * as getRawBody from 'raw-body';

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('upload')
  upload: UploadOptions;

  resolve(app) {
    console.log('type', app.getFrameworkType());
    if (app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
      
    } else {
      return async (ctx, next) => {
        console.log('req');
        const boundary = this.getUploadBoundary(ctx.request);
        console.log('boundary', boundary);
        if (!boundary) {
          return next();
        }

        const { mode, tmpdir, fileSize } = this.upload;
        const req = ctx.request?.req || ctx.request;
        let body;
        if (this.isStream(req)) {
          if (mode === UploadMode.Stream) {
            // TODO: stream
          }
          body = await getRawBody(req, {
            limit: fileSize,
          });
        } else {
          body =  req.body;
        }

        const data = await parseMultipart(body, boundary);
        if (!data) {
          return next();
        }

        ctx.fields = data.fields;
        const requireId = `upload_${Date.now()}.${Math.random()}`;
        ctx.files = mode === 'buffer' ? data.files : data.files.map((file, index) => {
          const { data, filename } = file;
          if (mode === UploadMode.File) {
            const ext = extname(filename);
            const tmpFileName = resolve(tmpdir, `${requireId}.${index}${ext}`);
            writeFileSync(tmpFileName, data, 'binary');
            file.data = tmpFileName;
          } else if (mode === UploadMode.Stream) {
            file.data = new Readable({
              read() {
                this.push(data);
                this.push(null);
              }
            });
          }
          return file;
        });
        
        return next();
      }
    }
  }

  getUploadBoundary(request): false|string {
    const method = (request.method || request.httpMethod || '').toUpperCase();
    if (
      !request.headers?.['content-type'] ||
      method !== 'POST'
    ) {
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


  isStream(req): boolean {
    if (!req.body && typeof req.on === 'function') {
      return true
    }
    return false;
  }
}

