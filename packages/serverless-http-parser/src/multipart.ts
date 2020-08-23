import * as Busboy from 'busboy';
export const formatMultipart = async (req: any) => {
  if (
    req.method !== 'POST' ||
    !req.headers['content-type'].startsWith('multipart/form-data') ||
    !Buffer.isBuffer(req.body)
  ) {
    return req;
  }
  return new Promise(resolve => {
    const busboy = new Busboy({
      headers: req.headers,
    });
    req.files = [];
    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      let fileBuffer = Buffer.from('');
      file.on('data', data => {
        fileBuffer = Buffer.concat([fileBuffer, data]);
      });

      file.on('end', () => {
        req.files.push({
          fieldname,
          filename,
          encoding,
          transferEncoding: encoding,
          mimeType,
          buffer: fileBuffer,
        });
      });
    });

    const bodyData = {};
    busboy.on('field', (fieldname, val) => {
      bodyData[fieldname] = val;
    });

    busboy.on('finish', () => {
      req.body = bodyData;
      resolve(req);
    });
    busboy.end(req.body);
  });
};
