export const parseMultipart = async (body: any, boundary: string) => {
  if (typeof body === 'string') {
    body = Buffer.from(body);
  }
  const bufferSeparator = Buffer.from('\r\n--' + boundary);
  const headSeparator = Buffer.from('\r\n\r\n');
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

// search buffer index
export const bufferIndexOf = (
  buffer: Buffer,
  search: Buffer,
  offset?: number
) => {
  offset = offset || 0;

  if (search.length + offset > buffer.length) {
    return -1;
  }

  let x = 0;
  let f = -1;

  for (; offset < buffer.length; offset++) {
    if (buffer[offset] === search[x]) {
      if (!~f) {
        f = offset;
      }
      if (++x === search.length) {
        break;
      }
    } else {
      f = -1;
      x = 0;
    }
  }

  return f;
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
