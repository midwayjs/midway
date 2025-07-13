import { Framework, IMidwayWSApplication, IMidwayWSConfigurationOptions } from '../src';
import * as ws from '../src';
import { join } from 'path';
import { close, createLegacyApp } from '@midwayjs/mock';

/**
 * create a WebSocket app
 * @param name
 * @param options
 */
export async function createServer(name: string, options: IMidwayWSConfigurationOptions = {}): Promise<IMidwayWSApplication> {
  return createLegacyApp<Framework>(join(__dirname, 'fixtures', name), Object.assign({
    imports: [ws]
  }, options));
}

export async function closeApp(app) {
  return close(app);
}

/**
 * 测试 WebSocket 连接是否被拒绝
 * @param url WebSocket 连接 URL
 * @param timeout 超时时间（毫秒）
 * @returns Promise<boolean> true 表示连接被拒绝，false 表示连接成功
 */
export async function testConnectionRejected(url: string, timeout: number = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const WebSocket = require('ws');
    const client = new WebSocket(url);
    
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.terminate();
        resolve(true); // 超时认为连接被拒绝
      }
    }, timeout);

    client.on('open', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        client.close();
        resolve(false); // 连接成功
      }
    });

    client.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(true); // 连接被拒绝
      }
    });

    client.on('close', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(true); // 连接被拒绝
      }
    });
  });
}
