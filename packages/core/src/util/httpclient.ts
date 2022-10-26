import http = require('http');
import https = require('https');
import url = require('url');
import { debuglog } from 'util';
import { MidwayUtilHttpClientTimeoutError } from '../error';

const debug = debuglog('request-client');
const URL = url.URL;

type MethodType = 'GET' | 'POST';
type MimeType = 'text' | 'json' | undefined;
const mimeMap = {
  text: 'application/text',
  json: 'application/json',
  octet: 'application/octet-stream',
};

interface IOptions {
  method?: MethodType;
  headers?: any;
  contentType?: MimeType;
  dataType?: MimeType;
  data?: any;
  timeout?: number;
}

export interface IResponse extends http.IncomingMessage {
  status: number;
  data: Buffer | string | any;
}

export async function makeHttpRequest(
  url: string,
  options: IOptions = {}
): Promise<IResponse> {
  debug(`request '${url}'`);
  const whatwgUrl = new URL(url);
  const client = whatwgUrl.protocol === 'https:' ? https : http;
  const contentType: MimeType = options.contentType;
  const dataType: MimeType = options.dataType;
  const method = (options.method || 'GET').toUpperCase();
  const timeout = options.timeout || 5000;

  const headers = {
    Accept: mimeMap[dataType] || mimeMap.octet,
    ...options.headers,
  };

  let data;
  if (method === 'GET' && options.data) {
    for (const key of Object.keys(options.data)) {
      whatwgUrl.searchParams.set(key, options.data[key]);
    }
    headers['Content-Length'] = 0;
  } else if (options.data) {
    data = Buffer.from(JSON.stringify(options.data));

    headers['Content-Type'] = mimeMap[contentType] || mimeMap.octet;
    headers['Content-Length'] = data.byteLength;
  }

  return new Promise((resolve, reject) => {
    const req = client.request(
      whatwgUrl.toString(),
      {
        method,
        headers,
      },
      res => {
        res.setTimeout(timeout, () => {
          res.destroy(new Error('Response Timeout'));
        });
        res.on('error', error => {
          reject(error);
        });
        const chunks = [];
        res.on('data', chunk => {
          chunks.push(chunk);
        });
        res.on('end', () => {
          let data: Buffer | string | any = Buffer.concat(chunks);
          if (dataType === 'text' || dataType === 'json') {
            data = data.toString('utf8');
          }
          if (dataType === 'json') {
            try {
              data = JSON.parse(data as string);
            } catch (e) {
              return reject(
                new Error('[httpclient] Unable to parse response data')
              );
            }
          }

          Object.assign(res, {
            status: res.statusCode,
            data,
          });
          debug(`request '${url}' resolved with status ${res.statusCode}`);
          resolve(res as IResponse);
        });
      }
    );
    req.setTimeout(timeout, () => {
      req.destroy(new MidwayUtilHttpClientTimeoutError('Request Timeout'));
    });
    req.on('error', error => {
      reject(error);
    });

    if (method !== 'GET') {
      req.end(data);
    } else {
      req.end();
    }
  });
}

/**
 * A simple http client
 */
export class HttpClient {
  constructor(
    readonly defaultOptions: Pick<
      IOptions,
      'headers' | 'timeout' | 'method'
    > = {}
  ) {}

  async request(url: string, options?: IOptions): Promise<IResponse> {
    return makeHttpRequest(url, Object.assign(this.defaultOptions, options));
  }
}
