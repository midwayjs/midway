import { Transform } from 'stream';
import {
  EventData,
  MessageEvent,
  ServerSendEventStreamOptions,
} from './interface';

export class ServerSendEventStream extends Transform {
  private ctx: any;
  private isActive = false;
  private closeEvent = 'close';

  constructor(ctx, options: ServerSendEventStreamOptions = {}) {
    super({
      objectMode: true,
      ...options,
    });
    this.ctx = ctx;
  }

  _transform(chunk, encoding, callback) {
    let senderObject,
      dataLines,
      prefix = 'data: ';

    const commentReg = /^\s*:\s*/;
    const res = [];
    if (!this.isActive) {
      this.isActive = true;
      this.ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      this.ctx.req.socket.setTimeout(0);
      this.ctx.req.socket.setNoDelay(true);
      this.ctx.req.socket.setKeepAlive(true);
      res.push({
        data: ':ok',
      });
    }

    if (typeof chunk === 'string') {
      senderObject = { data: chunk };
    } else {
      senderObject = chunk;
    }
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
  }

  sendEnd(data?: EventData) {
    this.send({
      data,
      event: this.closeEvent,
    });
  }

  send(message: MessageEvent | EventData): void {
    super.write(message);
  }
}
