import { Transform } from 'stream';
import {
  IMidwayContext,
  ServerSendEventForwardOptions,
  ServerSendEventMessage,
  ServerSendEventStreamOptions,
} from '../interface';

interface MessageEvent {
  data?: string | object;
  event?: string;
  id?: string;
  retry?: number;
}

export class ServerSendEventStream<
  CTX extends IMidwayContext,
> extends Transform {
  private readonly ctx: any;
  private isActive = false;
  private readonly closeEvent: string;
  private options: ServerSendEventStreamOptions<CTX>;
  private readonly closeHandlers = new Set<() => void>();

  constructor(ctx, options: ServerSendEventStreamOptions<CTX> = {}) {
    super({
      objectMode: true,
      ...options,
    });
    this.ctx = ctx;
    this.closeEvent = options.closeEvent || 'close';
    this.options = options;

    // 监听客户端关闭连接
    this.ctx.req.on('close', this.handleClose.bind(this));
  }

  _transform(chunk, encoding, callback) {
    try {
      let dataLines,
        prefix = 'data: ';

      const commentReg = /^\s*:\s*/;
      const res = [];
      if (!this.isActive) {
        this.isActive = true;
        const defaultHeader = {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        };

        for (const key in defaultHeader) {
          this.ctx.res.setHeader(key, defaultHeader[key]);
        }

        this.ctx.req.socket.setTimeout(0);
        this.ctx.req.socket.setNoDelay(true);
        this.ctx.req.socket.setKeepAlive(true);
        res.push(': ok');
      }

      const senderObject = chunk;

      if (senderObject.event) res.push('event: ' + senderObject.event);
      if (senderObject.retry) res.push('retry: ' + senderObject.retry);
      if (senderObject.id) res.push('id: ' + senderObject.id);
      if (typeof senderObject.data === 'object') {
        dataLines = JSON.stringify(senderObject.data);
        res.push(prefix + dataLines);
      } else if (typeof senderObject.data === 'undefined') {
        // Send an empty string even without data
        res.push(prefix);
      } else {
        senderObject.data = String(senderObject.data);
        if (senderObject.data.search(commentReg) !== -1) {
          senderObject.data = senderObject.data.replace(commentReg, '');
          prefix = ': ';
        }
        senderObject.data = senderObject.data.replace(/(\r\n|\r|\n)/g, '\n');
        dataLines = senderObject.data.split(/\n/);

        for (let i = 0, l = dataLines.length; i < l; ++i) {
          const line = dataLines[i];
          if (i + 1 === l) {
            res.push(prefix + line);
          } else {
            res.push(prefix + line);
          }
        }
      }

      this.push(res.join('\n') + '\n\n');
      callback();
    } catch (err) {
      this.ctx.logger.error(err);
      // send error to client
      this.sendError(err);
      // close stream
      this.end();
      // callback error
      callback(err);
    }
  }

  sendError(error: Error) {
    this.send({
      event: 'error',
      data: error.message || 'An error occurred',
    });
  }

  sendEnd(message: MessageEvent = {}) {
    message.event = this.closeEvent;
    this.send(message);
  }

  send(message: MessageEvent): void {
    super.write(this.options.tpl(message, this.ctx));
  }

  /**
   * Forward async iterable SDK stream chunks as protocol-compatible SSE frames.
   */
  async forward<T>(
    source: AsyncIterable<T>,
    options: ServerSendEventForwardOptions<T, CTX> = {}
  ): Promise<void> {
    const protocol = options.protocol || 'eventsource';
    const abort = () => {
      options.abortController?.abort();
    };
    this.closeHandlers.add(abort);

    try {
      for await (const rawChunk of source) {
        if (!this.writable || this.destroyed) {
          break;
        }

        const chunk = options.transform
          ? await options.transform(rawChunk, this.ctx)
          : rawChunk;

        if (chunk === null) {
          continue;
        }

        this.send(this.createForwardMessage(chunk, protocol));
      }

      this.sendForwardEnd(protocol, options.closeEvent);
    } catch (err) {
      if (options.abortController?.signal.aborted || !this.writable) {
        this.end();
        return;
      }
      this.ctx.logger.error(err);
      this.sendError(err as Error);
      this.end();
    } finally {
      this.closeHandlers.delete(abort);
    }
  }

  private createForwardMessage(
    chunk: unknown,
    protocol: ServerSendEventForwardOptions['protocol']
  ): ServerSendEventMessage {
    if (protocol === 'anthropic') {
      return {
        event: this.getChunkType(chunk),
        data: this.getForwardData(chunk),
      };
    }

    return {
      data: this.getForwardData(chunk),
    };
  }

  private sendForwardEnd(
    protocol: ServerSendEventForwardOptions['protocol'],
    closeEvent: string | false
  ) {
    if (!this.writable || this.destroyed) {
      return;
    }

    if (protocol === 'openai') {
      this.send({
        data: '[DONE]',
      });
      this.end();
      return;
    }

    if (protocol === 'eventsource' && closeEvent !== false) {
      this.send({
        event: closeEvent || this.closeEvent,
        data: '',
      });
    }

    this.end();
  }

  private getChunkType(chunk: unknown): string | undefined {
    if (chunk && typeof chunk === 'object') {
      const type = (chunk as { type?: unknown }).type;
      if (typeof type === 'string') {
        return type;
      }
    }
  }

  private getForwardData(chunk: unknown): string | object {
    if (typeof chunk === 'string') {
      return chunk;
    }

    if (Buffer.isBuffer(chunk)) {
      return chunk.toString();
    }

    if (chunk && typeof chunk === 'object') {
      return chunk;
    }

    return String(chunk);
  }

  private handleClose() {
    for (const handler of this.closeHandlers) {
      handler();
    }
    this.end();
  }
}
