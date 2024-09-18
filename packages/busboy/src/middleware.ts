import {
  Config,
  Logger,
  Middleware,
  Init,
  IMiddleware,
  ILogger,
  IgnoreMatcher,
  IMidwayApplication,
  extend,
} from '@midwayjs/core';
import { resolve } from 'path';
import { createWriteStream, promises } from 'fs';
import { Readable, Stream } from 'stream';
import {
  MultipartError,
  MultipartFieldsLimitError,
  MultipartFileLimitError,
  MultipartFileSizeLimitError,
  MultipartInvalidFilenameError,
  MultipartInvalidFileTypeError,
  MultipartPartsLimitError,
} from './error';
import {
  UploadStreamFieldInfo,
  UploadFileInfo,
  UploadOptions,
  UploadStreamFileInfo,
  UploadMode,
} from './interface';
import { parseMultipart } from './parse';
import { fromBuffer } from 'file-type';
import { formatExt, streamToAsyncIterator } from './utils';
import * as busboy from 'busboy';
import { BusboyConfig } from 'busboy';
import { EXT_KEY } from './constants';

const { unlink, writeFile } = promises;

@Middleware()
export class UploadMiddleware implements IMiddleware<any, any> {
  @Config('busboy')
  uploadConfig: UploadOptions;

  @Logger()
  logger: ILogger;

  /**
   * cache global upload white list when uploadConfig.whitelist is set
   * @private
   */
  private uploadWhiteListMap = new Map<string, string>();
  /**
   * cache global upload mime type white list when uploadConfig.mimeTypeWhiteList is set
   * @private
   */
  private uploadFileMimeTypeMap = new Map<string, string[]>();
  match: IgnoreMatcher<any>[];
  ignore: IgnoreMatcher<any>[];

  @Init()
  async init() {
    if (this.uploadConfig.match) {
      this.match = [].concat(this.uploadConfig.match || []);
    } else {
      this.ignore = [].concat(this.uploadConfig.ignore || []);
    }

    if (
      this.uploadConfig.whitelist &&
      Array.isArray(this.uploadConfig.whitelist)
    ) {
      for (const whiteExt of this.uploadConfig.whitelist) {
        this.uploadWhiteListMap.set(whiteExt, whiteExt);
      }
    }
    if (this.uploadConfig.mimeTypeWhiteList) {
      for (const ext in this.uploadConfig.mimeTypeWhiteList) {
        const mime = [].concat(this.uploadConfig.mimeTypeWhiteList[ext]);
        this.uploadFileMimeTypeMap.set(ext, mime);
      }
    }
  }

  resolve(
    app: IMidwayApplication,
    options?: {
      mode?: UploadMode;
    } & BusboyConfig
  ) {
    const isExpress = app.getNamespace() === 'express';
    const uploadConfig: UploadOptions = options
      ? extend({}, this.uploadConfig, options || {})
      : this.uploadConfig;

    return async (ctxOrReq, resOrNext, next) => {
      const req = ctxOrReq.request?.req || ctxOrReq.request || ctxOrReq;
      next = isExpress ? next : resOrNext;
      const boundary = this.getUploadBoundary(req);
      if (!boundary) {
        return next();
      }

      const useAsyncIterator = uploadConfig.mode === 'asyncIterator';

      // create new map include custom white list
      const currentContextWhiteListMap = new Map([
        ...this.uploadWhiteListMap.entries(),
      ]);
      if (typeof uploadConfig.whitelist === 'function') {
        const whiteListArray = uploadConfig.whitelist.call(this, ctxOrReq);
        whiteListArray.forEach(ext => currentContextWhiteListMap.set(ext, ext));
      }
      // create new map include custom mime type white list
      const currentContextMimeTypeWhiteListMap = new Map([
        ...this.uploadFileMimeTypeMap.entries(),
      ]);
      if (typeof uploadConfig.mimeTypeWhiteList === 'function') {
        const mimeTypeWhiteList = uploadConfig.mimeTypeWhiteList.call(
          this,
          ctxOrReq
        );
        for (const ext in mimeTypeWhiteList) {
          const mime = [].concat(mimeTypeWhiteList[ext]);
          currentContextMimeTypeWhiteListMap.set(ext, mime);
        }
      }

      ctxOrReq.cleanupRequestFiles = async (): Promise<Array<boolean>> => {
        if (!ctxOrReq.files?.length) {
          return [];
        }
        return Promise.all(
          ctxOrReq.files.map(
            async (fileInfo: UploadFileInfo | UploadStreamFileInfo) => {
              if (typeof fileInfo.data !== 'string') {
                return false;
              }
              try {
                await unlink(fileInfo.data);
                return true;
              } catch {
                return false;
              }
            }
          )
        );
      };

      if (this.isReadableStream(req, isExpress)) {
        if (useAsyncIterator) {
          await this.processAsyncIterator(
            req,
            uploadConfig,
            currentContextWhiteListMap,
            currentContextMimeTypeWhiteListMap,
            ctxOrReq
          );
        } else {
          await this.processFileOrStream(
            req,
            uploadConfig,
            currentContextWhiteListMap,
            currentContextMimeTypeWhiteListMap,
            ctxOrReq
          );
        }
      } else {
        await this.processServerlessUpload(
          req,
          boundary,
          uploadConfig,
          next,
          currentContextWhiteListMap,
          currentContextMimeTypeWhiteListMap,
          ctxOrReq
        );
      }

      await next();
    };
  }

  private async processFileOrStream(
    req,
    uploadConfig,
    currentContextWhiteListMap,
    currentContextMimeTypeWhiteListMap,
    ctxOrReq
  ) {
    let isStreamResolve = false;
    const { mode, tmpdir } = uploadConfig;
    const { files = [], fields = [] } = await new Promise<any>(
      (resolveP, reject) => {
        const bb = busboy({
          headers: req.headers,
          ...uploadConfig,
        });
        const fields: Array<UploadStreamFieldInfo> = [];
        const files: Array<UploadFileInfo | UploadStreamFileInfo> = [];
        let fileModeCount = 0;
        bb.on('file', async (name, file, info) => {
          const { filename, encoding, mimeType } = info;
          const ext = this.checkAndGetExt(filename, currentContextWhiteListMap);
          if (!ext) {
            reject(new MultipartInvalidFilenameError(filename));
          }

          file.once('limit', () => {
            reject(new MultipartFileSizeLimitError(filename));
          });

          if (mode === 'stream') {
            if (isStreamResolve) {
              // will be skip
              file.resume();
              return;
            }
            (files as Array<any>).push(
              new Promise(resolve => {
                resolve({
                  fieldName: name,
                  filename,
                  encoding,
                  mimeType,
                  data: file,
                });
              })
            );
            isStreamResolve = true;
            // busboy 这里无法触发 close 事件，所以这里直接 resolve
            return resolveP({
              fields,
              files: await Promise.all(files),
            });
          } else {
            fileModeCount++;
            // file mode
            const requireId = `upload_${Date.now()}.${Math.random()}`;
            // read stream pipe to temp file
            const tempFile = resolve(tmpdir, `${requireId}${ext}`);
            // get buffer from stream, and check file type
            file.once('data', async chunk => {
              const { passed, mime, current } = await this.checkFileType(
                ext as string,
                chunk,
                currentContextMimeTypeWhiteListMap
              );
              if (!passed) {
                file.pause();
                reject(
                  new MultipartInvalidFileTypeError(filename, current, mime)
                );
              }
            });
            const writeStream = file.pipe(createWriteStream(tempFile));
            file.on('end', () => {
              fileModeCount--;
            });
            writeStream.on('error', reject);
            writeStream.on('finish', () => {
              (files as Array<any>).push({
                filename,
                mimeType,
                encoding,
                fieldName: name,
                data: tempFile,
              });

              if (fileModeCount === 0) {
                // 文件模式下，要等所有文件都处理完毕
                return resolveP({
                  fields,
                  files,
                });
              }
            });
          }
        });
        bb.on('field', (name, value, info) => {
          (fields as Array<any>).push({
            name,
            value,
            info,
          });
        });

        bb.on('error', (err: Error) => {
          reject(new MultipartError(err));
        });
        bb.on('partsLimit', () => {
          reject(new MultipartPartsLimitError());
        });
        bb.on('filesLimit', () => {
          reject(new MultipartFileLimitError());
        });
        bb.on('fieldsLimit', () => {
          reject(new MultipartFieldsLimitError());
        });
        req.pipe(bb);
      }
    );

    ctxOrReq.files = files;
    ctxOrReq.fields = fields.reduce((accumulator, current) => {
      accumulator[current.name] = current.value;
      return accumulator;
    }, {});
  }

  private async processAsyncIterator(
    req,
    uploadConfig,
    currentContextWhiteListMap,
    currentContextMimeTypeWhiteListMap,
    ctxOrReq
  ) {
    const bb = busboy({
      headers: req.headers,
      ...uploadConfig,
    });

    const fileReadable = new Readable({
      objectMode: true,
      read() {},
      autoDestroy: true,
    });
    const fieldReadable = new Readable({
      objectMode: true,
      read() {},
      autoDestroy: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    async function* streamToAsyncIteratorWithError(
      stream: Readable
    ): AsyncGenerator<any> {
      for await (const chunk of stream) {
        chunk.data.once('data', async chunk => {
          const { passed, mime, current } = await self.checkFileType(
            chunk.ext,
            chunk,
            currentContextMimeTypeWhiteListMap
          );
          if (!passed) {
            throw new MultipartInvalidFileTypeError(
              chunk.filename,
              current,
              mime
            );
          }
        });

        yield chunk;
      }
    }

    const files = streamToAsyncIteratorWithError(fileReadable);
    const fields = streamToAsyncIterator(fieldReadable);

    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const ext = this.checkAndGetExt(filename, currentContextWhiteListMap);
      if (!ext) {
        fileReadable.emit('error', new MultipartInvalidFilenameError(filename));
        return;
      }

      file.once('limit', () => {
        fileReadable.emit('error', new MultipartFileSizeLimitError(filename));
      });

      fileReadable.push({
        fieldName: name,
        filename,
        mimeType,
        encoding,
        data: file,
        ext,
      });
    });

    bb.on('field', (name, value, info) => {
      fieldReadable.push({
        name,
        value,
        info,
      });
    });

    bb.on('close', () => {
      fileReadable.push(null);
      fieldReadable.push(null);
    });

    bb.on('error', (err: Error) => {
      fileReadable.emit('error', new MultipartError(err));
    });

    bb.on('partsLimit', () => {
      fileReadable.emit('error', new MultipartPartsLimitError());
    });
    bb.on('filesLimit', () => {
      fileReadable.emit('error', new MultipartFileLimitError());
    });
    bb.on('fieldsLimit', () => {
      fieldReadable.emit('error', new MultipartFieldsLimitError());
    });
    req.pipe(bb);

    ctxOrReq.fields = fields;
    ctxOrReq.files = files;
  }

  private async processServerlessUpload(
    req,
    boundary,
    uploadConfig,
    next,
    currentContextWhiteListMap,
    currentContextMimeTypeWhiteListMap,
    ctxOrReq
  ) {
    let body;
    if (
      req?.originEvent?.body &&
      (typeof req.originEvent.body === 'string' ||
        Buffer.isBuffer(req.originEvent.body))
    ) {
      body = req.originEvent.body;
    } else {
      body = req.body;
    }

    const { mode, tmpdir } = uploadConfig;
    const data = await parseMultipart(body, boundary, uploadConfig);
    if (!data) {
      return next();
    }

    const requireId = `upload_${Date.now()}.${Math.random()}`;
    for (const fileInfo of data.files) {
      const ext = this.checkAndGetExt(
        fileInfo.filename,
        currentContextWhiteListMap
      );
      if (!ext) {
        throw new MultipartInvalidFilenameError(fileInfo.filename);
      }
      const { passed, mime, current } = await this.checkFileType(
        ext as string,
        fileInfo.data,
        currentContextMimeTypeWhiteListMap
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
    const files = await Promise.all(
      data.files.map(async (file, index) => {
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

    ctxOrReq.fields = data.fields;
    ctxOrReq.files = files;
  }

  static getName() {
    return 'upload';
  }

  // check extensions
  checkAndGetExt(
    filename,
    whiteListMap = this.uploadWhiteListMap
  ): string | boolean {
    const lowerCaseFileNameList = filename.toLowerCase().split('.');
    while (lowerCaseFileNameList.length) {
      lowerCaseFileNameList.shift();
      const curExt = `.${lowerCaseFileNameList.join('.')}`;
      if (this.uploadConfig.whitelist === null) {
        return formatExt(curExt);
      }
      if (whiteListMap.has(curExt)) {
        // Avoid the presence of hidden characters and return extensions in the white list.
        return whiteListMap.get(curExt);
      }
    }
    return false;
  }

  // check file-type
  async checkFileType(
    ext: string,
    data: Buffer,
    uploadFileMimeTypeMap = this.uploadFileMimeTypeMap
  ): Promise<{ passed: boolean; mime?: string; current?: string }> {
    // fileType == null, pass check
    if (!this.uploadConfig.mimeTypeWhiteList) {
      return { passed: true };
    }

    const mime = uploadFileMimeTypeMap.get(ext);
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
}
