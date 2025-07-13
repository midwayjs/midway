import { Configuration, App } from '@midwayjs/core';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from '../../../../src';
import { UpgradeAuthHandler } from '../../../../src';
import * as http from 'http';

@Configuration({
  importConfigs: [
    {
      default: {
        webSocket: {
          port: 3000,
        }
      }
    }
  ]
})
export class AutoConfiguration implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
    // 设置升级鉴权处理函数
    this.app.onWebSocketUpgrade(this.authHandler);
  }

  private authHandler: UpgradeAuthHandler = async (
    request: http.IncomingMessage,
    socket: any,
    head: Buffer
  ): Promise<boolean> => {
    try {
      // 从 URL 参数获取 token
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      // 简单的 token 验证
      if (token === 'valid-token') {
        console.log('[Test Auth] Valid token, connection allowed');
        return true;
      }
      
      console.log('[Test Auth] Invalid or missing token, connection denied');
      return false;
    } catch (error) {
      console.error('[Test Auth] Authentication error:', error);
      return false;
    }
  };
} 