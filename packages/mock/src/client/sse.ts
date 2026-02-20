import * as http from 'http';
import * as https from 'https';
import { EventEmitter } from 'events';

export interface SSEClientOptions {
  headers?: Record<string, string>;
  timeout?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class SSEClient extends EventEmitter {
  private request?: http.ClientRequest;
  private reconnectAttempts = 0;
  private shouldReconnect = true;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(
    private url: string,
    private options: SSEClientOptions = {}
  ) {
    super();
    this.options = {
      timeout: 30000,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(this.url);
      const isSecure = parsedUrl.protocol === 'https:';
      const httpModule = isSecure ? https : http;

      const requestOptions: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          ...this.options.headers,
        },
      };

      this.request = httpModule.request(requestOptions, response => {
        if (response.statusCode !== 200) {
          reject(
            new Error(
              `SSE connection failed with status: ${response.statusCode}`
            )
          );
          return;
        }

        this.reconnectAttempts = 0;
        this.emit('connected');
        resolve();

        response.setEncoding('utf8');

        let buffer = '';
        response.on('data', (chunk: string) => {
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            this.processLine(line);
          }
        });

        response.on('end', () => {
          this.emit('disconnected');
          if (
            this.shouldReconnect &&
            this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)
          ) {
            this.scheduleReconnect();
          }
        });

        response.on('error', error => {
          this.emit('error', error);
        });
      });

      this.request.on('error', error => {
        reject(error);
        if (
          this.shouldReconnect &&
          this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)
        ) {
          this.scheduleReconnect();
        }
      });

      this.request.on('timeout', () => {
        this.request?.destroy();
        reject(new Error('SSE connection timeout'));
      });

      if (this.options.timeout) {
        this.request.setTimeout(this.options.timeout);
      }

      this.request.end();
    });
  }

  private processLine(line: string): void {
    if (line.trim() === '') {
      return;
    }

    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      try {
        const parsed = JSON.parse(data);
        this.emit('message', parsed);
      } catch {
        this.emit('message', data);
      }
    } else if (line.startsWith('event: ')) {
      const eventType = line.substring(7);
      this.emit('event', eventType);
    } else if (line.startsWith('id: ')) {
      const id = line.substring(4);
      this.emit('id', id);
    } else if (line.startsWith('retry: ')) {
      const retry = parseInt(line.substring(7), 10);
      if (!isNaN(retry)) {
        this.options.reconnectInterval = retry;
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.emit('error', error);
      });
    }, this.options.reconnectInterval);
  }

  close(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.request) {
      this.request.destroy();
    }
    this.emit('closed');
  }
}

export function createSSEClient(
  url: string,
  options?: SSEClientOptions
): SSEClient {
  return new SSEClient(url, options);
}
