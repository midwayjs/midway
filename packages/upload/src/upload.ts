import { Readable, Transform, Writable } from 'stream';
const headSeparator = Buffer.from('\r\n\r\n');
export const parseMultipart = async (body: any, boundary: string) => {
  if (typeof body === 'string') {
    body = Buffer.from(body);
  }
  const bufferSeparator = Buffer.from('\r\n--' + boundary);
  const fields = {};
  const files = [];
  bufferSplit(body, bufferSeparator).forEach(buf => {
    const [headerBuf, data] = bufferSplit(buf, headSeparator, 2);
    const head = parseHead(headerBuf);
    if (!head['content-disposition']) {
      return;
    }
    if (!head['content-disposition'].filename) {
      if (head['content-disposition'].name) {
        fields[head['content-disposition'].name] = data.toString();
      }
      return;
    }
    files.push({
      filename: head['content-disposition'].filename,
      data,
      fieldname: head['content-disposition'].name,
      mimeType: head['content-type'],
    });
  });

  return {
    files,
    fields,
  };
};

const pre = Buffer.from(`\r\n`);
export const parseFromWritableStream = (
  readStream: Readable,
  boundary,
) => {
  const bufferSeparator = Buffer.from(`\r\n--${boundary}`);
  const fields = {};
  const fileInfo = {
    filename: '',
    data: null,
    fieldname: '',
    mimeType: '',
  };
  let emptyBuf = Buffer.alloc(0);
  // 上一次遗留的 chunk
  let lastChunk = emptyBuf;
  // 前一个chunk的后缀
  let preChunk = emptyBuf;
  let isTransformFileData = false;
  let isTransformFileDataEnd = false;
  // let isEnd = false;
  let isFirst = true
  let allChuns = Buffer.alloc(0);
  return new Promise(resolve => {
    fileInfo.data = new Transform({
      highWaterMark: 1000,
      transform(chunk, encoding, callback) {
        if (isFirst) {
          chunk = Buffer.concat([pre, chunk])
          isFirst = false;
        }
        // 已经结束了
        if (isTransformFileDataEnd) {
          return callback(null, null);
        }

        // 正在传输中的话
        if (isTransformFileData) {

          if (lastChunk.length) {
            chunk = Buffer.concat([lastChunk, chunk]);
            lastChunk = emptyBuf;
          }
          const newPreChunk = Buffer.concat([preChunk, chunk]);
          const newBlockIndex = bufferIndexOf(newPreChunk, bufferSeparator);
          // 存在新的块则代表已经结束了
          if (newBlockIndex !== -1) {
            // 上一个块的最后一部分数据，需要追加写入
            const lastDataBlock = newPreChunk.slice(preChunk.length, newBlockIndex);
            isTransformFileDataEnd = true;
            callback(null, lastDataBlock);
            return;
          }
          // 块尚未结束，则继续写入
          callback(null, chunk);
          preChunk = newPreChunk.slice(-bufferSeparator.length);
          return;
        }

        // 未在传输过程中
        allChuns = Buffer.concat([allChuns, chunk]);

        const splitAllChuns = bufferSplit(allChuns, bufferSeparator);
        for(let chunkIndex = 0; chunkIndex < splitAllChuns.length; chunkIndex ++) {
          const [headerBuf, data] = bufferSplit(splitAllChuns[chunkIndex], headSeparator);
          const head = parseHead(headerBuf);
          if (!head['content-disposition']) {
            continue
          }
          if (!head['content-disposition'].filename) {
            if (head['content-disposition'].name) {
              fields[head['content-disposition'].name] = data.toString();
            }
            continue;
          }
          // 这里就是找到了 file 的段，如果没有数据，则需要继续等待
          if (!data.length) {
            continue;
          }

          fileInfo.filename = head['content-disposition'].filename;
          fileInfo.fieldname = head['content-disposition'].name;
          fileInfo.mimeType = head['content-type'];
          isTransformFileData = true;
          lastChunk = data;
          allChuns = emptyBuf;
          this.pause();
          resolve({ fileInfo, fields})
          break;
        }

        callback(null, emptyBuf);
      },
    });
    readStream.pipe(fileInfo.data);
    const empty = new Writable();
    empty._write = function (chunk, encoding, cb) {
      cb();
    };
    fileInfo.data.pipe(empty);
  });
};

// search buffer index
export const bufferIndexOf = (
  buffer: Buffer,
  search: Buffer,
  offset?: number
) => {
  return buffer.indexOf(search, offset);
};

// split buffer to buffer list
export const bufferSplit = (
  buffer: Buffer,
  separator: Buffer,
  limit?: number
) => {
  let index = 0;
  const result: Buffer[] = [];
  let find: number = bufferIndexOf(buffer, separator, index);

  while (find !== -1) {
    result.push(buffer.slice(index, find));
    index = find + separator.length;
    if (limit && result.length + 1 === limit) {
      break;
    }
    find = bufferIndexOf(buffer, separator, index);
  }

  result.push(buffer.slice(index));
  return result;
};

const headReg = /^([^:]+):[ \t]?(.+)?$/;
export const parseHead = (headBuf: Buffer) => {
  const head = {};
  const headStrList = headBuf.toString().split('\r\n');
  for (const headStr of headStrList) {
    const matched = headReg.exec(headStr);
    if (!matched) {
      continue;
    }
    const name = matched[1].toLowerCase();
    const value = matched[2]
      ? matched[2].replace(/&#(\d+);/g, (origin: string, code: string) => {
          try {
            return String.fromCharCode(parseInt(code));
          } catch {
            return origin;
          }
        })
      : '';
    if (name === 'content-disposition') {
      const headCol = {};
      value.split(/;\s+/).forEach((kv: string) => {
        const [k, v] = kv.split('=');
        headCol[k] = v ? v.replace(/^"/, '').replace(/"$/, '') : v ?? true;
      });
      head[name] = headCol;
    } else {
      head[name] = value;
    }
  }
  return head;
};

