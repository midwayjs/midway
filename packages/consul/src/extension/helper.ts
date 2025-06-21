import ms from 'ms';
import { ILogger } from '@midwayjs/core';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { createServer as createTcpServer, Server as TcpServer } from 'net';

/**
 * Consul 服务实例 TTL 心跳上报工具类
 */
interface TTLHeartbeatOptions {
  consul: any; // consul 客户端实例
  checkId: string; // 健康检查 ID（如 service:xxx）
  interval?: number; // 上报间隔（毫秒）
  logger?: ILogger;
}

export class TTLHeartbeat {
  private consul: any;
  private checkId: string;
  private interval: number;
  private timer: NodeJS.Timeout | null = null;
  private logger: ILogger;

  /**
   * @param {TTLHeartbeatOptions} options - 配置项
   */
  constructor(options: TTLHeartbeatOptions) {
    this.consul = options.consul;
    this.checkId = options.checkId;
    this.interval = options.interval ?? 5000;
    this.logger = options.logger;
  }

  /**
   * 启动心跳
   */
  start() {
    if (this.timer) return;
    this.timer = setInterval(async () => {
      try {
        await this.consul.agent.check.pass(this.checkId);
        // this.logger.info?.(`[TTL] ${this.checkId} 心跳上报成功`);
      } catch (err) {
        this.logger.error(`[TTL] ${this.checkId} 心跳上报失败:`, err);
      }
    }, this.interval);
  }

  /**
   * 停止心跳
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

/**
 * 计算 Consul 健康检查 TTL 毫秒值
 * @param ttl 用户传入的 ttl，支持字符串（如 "30s"、"1m"、"1m30s"）或数字（秒）
 * @returns {number} 毫秒数，最小 1000ms
 */
export function calculateTTL(ttl: string): number {
  const ttlMs = ms(ttl);
  // 最小不能低于 1 秒
  return Math.max(ttlMs, 1000);
}

/**
 * HTTP 健康检查工具类
 * 传入 http url，自动启动一个健康检查服务
 */
export class HTTPHealthCheck {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;
  private path: string;
  private message: string;

  /**
   * @param httpUrl 形如 'http://127.0.0.1:3000/health'
   * @param message 健康时返回的内容，默认 'ok'
   */
  constructor(httpUrl: string, message = 'ok') {
    const url = new URL(httpUrl);
    this.port = Number(url.port) || 80;
    this.path = url.pathname;
    this.message = message;
  }

  /**
   * 启动健康检查 HTTP 服务
   */
  start() {
    if (this.server) return;
    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.url === this.path && req.method === 'GET') {
        res.statusCode = 200;
        res.end(this.message);
      } else {
        res.statusCode = 404;
        res.end('not found');
      }
    });
    this.server.listen(this.port, () => {
      console.log(
        `[health] 健康检查服务已启动: http://127.0.0.1:${this.port}${this.path}`
      );
    });
  }

  /**
   * 停止健康检查 HTTP 服务
   */
  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

/**
 * TCP 健康检查工具类
 * 传入 tcp url，自动启动一个 TCP 服务
 */
export class TCPHealthCheck {
  private server: TcpServer | null = null;
  private port: number;
  private host: string;

  /**
   * @param tcpUrl 形如 'tcp://127.0.0.1:3000'
   */
  constructor(tcpUrl: string) {
    const url = new URL(tcpUrl);
    this.port = Number(url.port) || 80;
    this.host = url.hostname || '0.0.0.0';
  }

  /**
   * 启动 TCP 健康检查服务
   */
  start() {
    if (this.server) return;
    this.server = createTcpServer(socket => {
      // 只要能建立连接就立即关闭
      socket.end();
    });
    this.server.listen(this.port, this.host, () => {
      console.log(
        `[tcp-health] TCP 健康检查服务已启动: tcp://${this.host}:${this.port}`
      );
    });
  }

  /**
   * 停止 TCP 健康检查服务
   */
  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
