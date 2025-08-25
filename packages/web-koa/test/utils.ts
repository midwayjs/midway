import { IMidwayKoaConfigurationOptions, Framework, IMidwayKoaApplication } from '../src';
import * as koaModule from '../src';
import { join } from 'path';
import { createLegacyApp, close } from '@midwayjs/mock';
import axios from 'axios';

export async function creatApp(name: string, options: IMidwayKoaConfigurationOptions = {}): Promise<IMidwayKoaApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), {
    imports: [
      koaModule,
    ],
    ...options,
  });
}

export async function closeApp(app) {
  return close(app);
}

export { createHttpRequest } from '@midwayjs/mock';

/**
 * 真正启动服务器并发送 HTTP 请求的测试方法
 * 用于测试 listenOptions 等需要真正启动端口的配置
 */
export async function createRealHttpRequest(
  app: IMidwayKoaApplication,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}
): Promise<{
  status: number;
  text: string;
  body: any;
  headers: Record<string, string>;
}> {
  const framework = app.getFramework() as Framework;
  const server = framework.getServer();

  if (!server) {
    throw new Error('Server not started');
  }

  const port = framework.getPort();
  const host = '127.0.0.1';
  const url = `http://${host}:${port}${path}`;

  // 构建查询字符串
  let fullUrl = url;
  if (options.query && Object.keys(options.query).length > 0) {
    const queryString = new URLSearchParams(options.query).toString();
    fullUrl = `${url}?${queryString}`;
  }


  let response;
  try {
    // 发送请求
    response = await axios({
      method: options.method || 'GET',
      url: fullUrl,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      data: options.body,
    });
  } catch (err) {
    throw new Error(`Failed to request ${fullUrl}: ${err.message}`);
  }

  const text = response.data;
  let body: any;

  try {
    body = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    body = text;
  }

  return {
    status: response.status,
    text: typeof text === 'string' ? text : JSON.stringify(text),
    body,
    headers: response.headers,
  };
}

/**
 * 等待服务器启动完成
 */
export async function waitForServer(app: IMidwayKoaApplication): Promise<void> {
  const framework = app.getFramework() as Framework;
  const server = framework.getServer();

  if (!server) {
    throw new Error('Server not started');
  }

  return new Promise<void>((resolve) => {
    if (server.listening) {
      resolve();
    } else {
      server.once('listening', () => resolve());
    }
  });
}
