import { Transform } from 'stream';
import { ServerSendEventStreamOptions } from '../interface';

interface MessageEvent {
  data?: string | object;
  event?: string;
  id?: string;
  retry?: number;
}

export class ServerSendEventStream extends Transform {
  private readonly ctx: any;
  private isActive = false;
  private readonly closeEvent: string;
  private options: ServerSendEventStreamOptions;

  constructor(ctx, options: ServerSendEventStreamOptions = {}) {
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
        res.push({
          data: ':ok',
        });
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

  sendEnd(message?: MessageEvent) {
    message.event = this.closeEvent;
    this.send(message);
  }

  send(message: MessageEvent): void {
    super.write(this.options.tpl(message));
  }

  private handleClose() {
    this.end();
  }
}
