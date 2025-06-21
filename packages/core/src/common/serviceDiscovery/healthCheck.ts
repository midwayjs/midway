import {
  BaseServiceDiscoveryHealthCheckOptions,
  HTTPServiceDiscoveryHealthCheckOptions,
  IServiceDiscoveryHealthCheck,
  ServiceDiscoveryHealthCheckOptions,
  ServiceDiscoveryHealthCheckResult,
  ServiceDiscoveryHealthCheckType,
  TCPServiceDiscoveryHealthCheckOptions,
  TTLServiceDiscoveryHealthCheckOptions,
} from '../../interface';
import { HttpClient } from '../../util/httpclient';
import { MidwayCommonError } from '../../error';
import * as net from 'net';

/**
 * 抽象健康检查类
 */
export abstract class AbstractHealthCheck<ServiceInstance>
  implements IServiceDiscoveryHealthCheck<ServiceInstance>
{
  protected options: ServiceDiscoveryHealthCheckOptions;
  protected lastCheckTime = 0;
  protected lastCheckResult: ServiceDiscoveryHealthCheckResult | null = null;

  constructor(options: ServiceDiscoveryHealthCheckOptions) {
    // 设置默认值
    const defaultOptions: BaseServiceDiscoveryHealthCheckOptions = {
      interval: 10000, // 默认10秒
      timeout: 5000, // 默认5秒
      maxRetries: 3, // 默认3次
      retryInterval: 1000, // 默认1秒
    };

    // 合并默认值和传入的选项
    this.options = {
      ...defaultOptions,
      ...options,
    } as ServiceDiscoveryHealthCheckOptions;
  }

  /**
   * 执行健康检查
   * @param instance 服务实例
   */
  abstract check(
    instance: ServiceInstance
  ): Promise<ServiceDiscoveryHealthCheckResult>;

  /**
   * 是否需要检查
   * 根据检查间隔判断是否需要执行新的检查
   */
  shouldCheck(): boolean {
    const now = Date.now();
    return now - this.lastCheckTime >= this.options.interval!;
  }

  /**
   * 获取最后一次检查结果
   */
  getLastCheckResult(): ServiceDiscoveryHealthCheckResult | null {
    return this.lastCheckResult;
  }

  /**
   * 更新检查结果
   */
  protected updateCheckResult(result: ServiceDiscoveryHealthCheckResult): void {
    this.lastCheckTime = Date.now();
    this.lastCheckResult = result;
  }
}

/**
 * TTL 健康检查实现
 * 用于 Redis/ETCD 等基于 TTL 的服务发现
 */
export class TTLHealthCheck<
  ServiceInstance
> extends AbstractHealthCheck<ServiceInstance> {
  private ttl: number;

  constructor(options?: TTLServiceDiscoveryHealthCheckOptions) {
    super(options);
    this.ttl = options?.ttl;
  }

  async check(
    instance: ServiceInstance
  ): Promise<ServiceDiscoveryHealthCheckResult> {
    const now = Date.now();
    const lastUpdate = (instance as any).getMetadata()?.lastUpdate || 0;
    const timeSinceLastUpdate = now - lastUpdate;

    if (timeSinceLastUpdate > this.ttl * 1000) {
      return {
        status: 'critical',
        message: 'Service instance TTL expired',
        timestamp: now,
      };
    }

    return {
      status: 'passing',
      timestamp: now,
    };
  }
}

/**
 * HTTP 健康检查实现
 * 用于支持 HTTP 检查的服务发现
 */
export class HTTPHealthCheck<
  ServiceInstance
> extends AbstractHealthCheck<ServiceInstance> {
  private checkUrl: string;
  private httpClient: HttpClient;
  private httpOptions: HTTPServiceDiscoveryHealthCheckOptions;

  constructor(options: HTTPServiceDiscoveryHealthCheckOptions) {
    super(options);
    this.checkUrl = options.url;
    this.httpOptions = options;
    this.httpClient = new HttpClient({
      timeout: options.timeout || 5000,
    });
  }

  async check(
    instance: ServiceInstance
  ): Promise<ServiceDiscoveryHealthCheckResult> {
    const now = Date.now();
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.httpOptions.maxRetries!) {
      try {
        const response = await this.httpClient.request(this.checkUrl, {
          method: this.httpOptions.method || 'GET',
          headers: this.httpOptions.headers,
          timeout: this.httpOptions.timeout,
        });

        if (response.status === (this.httpOptions.expectedStatus || 200)) {
          return {
            status: 'passing',
            timestamp: now,
          };
        }

        lastError = new MidwayCommonError(
          `HTTP health check failed with status ${response.status}`
        );
        retries++;
        if (retries < this.httpOptions.maxRetries!) {
          await new Promise(resolve =>
            setTimeout(resolve, this.httpOptions.retryInterval)
          );
        }
      } catch (error) {
        lastError = new MidwayCommonError(
          `HTTP health check error: ${error.message}`
        );
        retries++;
        if (retries < this.httpOptions.maxRetries!) {
          await new Promise(resolve =>
            setTimeout(resolve, this.httpOptions.retryInterval)
          );
        }
      }
    }

    return {
      status: 'critical',
      message: lastError?.message || 'Health check failed after all retries',
      timestamp: now,
    };
  }
}

/**
 * TCP 健康检查实现
 * 用于支持 TCP 检查的服务发现
 */
export class TCPHealthCheck<
  ServiceInstance
> extends AbstractHealthCheck<ServiceInstance> {
  private host: string;
  private port: number;
  private tcpOptions: TCPServiceDiscoveryHealthCheckOptions;

  constructor(options: TCPServiceDiscoveryHealthCheckOptions) {
    super(options);
    this.host = options.host;
    this.port = options.port;
    this.tcpOptions = options;
  }

  async check(
    instance: ServiceInstance
  ): Promise<ServiceDiscoveryHealthCheckResult> {
    const now = Date.now();
    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.tcpOptions.maxRetries!) {
      try {
        const socket = new Promise((resolve, reject) => {
          const client = net.createConnection(this.port, this.host, () => {
            client.end();
            resolve(true);
          });

          client.on('error', error => {
            client.end();
            reject(
              new MidwayCommonError(`TCP connection failed: ${error.message}`)
            );
          });

          client.setTimeout(this.tcpOptions.timeout!, () => {
            client.end();
            reject(new MidwayCommonError('TCP connection timeout'));
          });
        });

        await socket;
        return {
          status: 'passing',
          timestamp: now,
        };
      } catch (error) {
        lastError =
          error instanceof MidwayCommonError
            ? error
            : new MidwayCommonError(`TCP health check error: ${error.message}`);
        retries++;
        if (retries < this.tcpOptions.maxRetries!) {
          await new Promise(resolve =>
            setTimeout(resolve, this.tcpOptions.retryInterval)
          );
        }
      }
    }

    return {
      status: 'critical',
      message:
        lastError?.message || 'TCP health check failed after all retries',
      timestamp: now,
    };
  }
}

/**
 * 健康检查工厂
 */
export class ServiceDiscoveryHealthCheckFactory {
  static create<ServiceInstance>(
    type: ServiceDiscoveryHealthCheckType,
    options:
      | ServiceDiscoveryHealthCheckOptions
      | IServiceDiscoveryHealthCheck<ServiceInstance>
  ): IServiceDiscoveryHealthCheck<ServiceInstance> {
    switch (type) {
      case 'self':
        return undefined;
      case 'ttl':
        return new TTLHealthCheck(
          options as TTLServiceDiscoveryHealthCheckOptions
        );
      case 'http':
        return new HTTPHealthCheck(
          options as HTTPServiceDiscoveryHealthCheckOptions
        );
      case 'tcp':
        return new TCPHealthCheck(
          options as TCPServiceDiscoveryHealthCheckOptions
        );
      case 'custom':
        return options as IServiceDiscoveryHealthCheck<ServiceInstance>;
      default:
        throw new MidwayCommonError(`Unsupported health check type: ${type}`);
    }
  }
}
