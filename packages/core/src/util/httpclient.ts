import http = require('http');
import https = require('https');
import url = require('url');
import { debuglog } from 'util';
import { MidwayUtilHttpClientTimeoutError } from '../error';

const debug = debuglog('request-client');
const URL = url.URL;

export type HttpClientMimeType = 'text' | 'json' | undefined;
const mimeMap = {
  text: 'application/text',
  json: 'application/json',
  octet: 'application/octet-stream',
};

export interface HttpClientOptions<Data = any> extends https.RequestOptions {
  headers?: any;
  contentType?: HttpClientMimeType;
  dataType?: HttpClientMimeType;
  data?: Data;
  timeout?: number;
}

export interface HttpClientResponse<ResType = any>
  extends http.IncomingMessage {
  status: number;
  data: Buffer | string | ResType;
}

function isHeaderExists(headers, headerKey: string): boolean {
  return (
    headers[headerKey] ||
    headers[headerKey.toLowerCase()] ||
    headers[headerKey.toUpperCase()]
  );
}

export async function makeHttpRequest<ResType>(
  url: string,
  options: HttpClientOptions = {}
): Promise<HttpClientResponse<ResType>> {
  debug(`request '${url}'`);
  const whatwgUrl = new URL(url);
  const client = whatwgUrl.protocol === 'https:' ? https : http;
  options.method = (options.method || 'GET').toUpperCase();
  const {
    contentType,
    dataType,
    method,
    timeout = 5000,
    headers: customHeaders,
    ...otherOptions
  } = options;

  const headers = {
    Accept: mimeMap[dataType] || mimeMap.octet,
    ...customHeaders,
  };

  let data;
  if (method === 'GET' && options.data) {
    for (const key of Object.keys(options.data)) {
      whatwgUrl.searchParams.set(key, options.data[key]);
    }
    headers['Content-Length'] = 0;
  } else if (options.data) {
    data = Buffer.from(JSON.stringify(options.data));

    if (!isHeaderExists(headers, 'Content-Type')) {
      headers['Content-Type'] = mimeMap[contentType] || mimeMap.octet;
    }
    if (!isHeaderExists(headers, 'Content-Length')) {
      headers['Content-Length'] = data.byteLength;
    }
  }

  return new Promise((resolve, reject) => {
    const req = client.request(
      whatwgUrl.toString(),
      {
        method,
        headers,
        ...otherOptions,
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
          resolve(res as HttpClientResponse);
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
      HttpClientOptions,
      'headers' | 'timeout' | 'method'
    > = {}
  ) {}

  async request(
    url: string,
    options?: HttpClientOptions
  ): Promise<HttpClientResponse> {
    return makeHttpRequest(
      url,
      Object.assign({}, this.defaultOptions, options)
    );
  }
}
