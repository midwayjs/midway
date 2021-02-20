import { Metadata } from '@grpc/grpc-js';
import { IClientDuplexStreamService } from '../../interface';

export class ClientDuplexStreamRequest<reqType, resType> implements IClientDuplexStreamService<reqType, resType> {

  correlationId: number;
  timeout_message;
  queue;
  client;
  metadata;
  timeout;
  stream;
  promise;

  static get MAX_INT32() {
    return 2147483647;
  }

  constructor(client, original_function, options: {
    metadata?: Metadata;
    timeout?: number;
    timeout_message?: number;
  } = {}) {
    this.queue = {};
    this.correlationId = 0;
    this.timeout_message = options.timeout_message || 1000;
    this.metadata = options.metadata || new Metadata();

    // Deadline is advisable to be set
    // It should be a timestamp value in milliseconds
    let deadline = undefined;
    if (options.timeout !== undefined) {
      deadline = Date.now() + options.timeout;
    }
    this.stream = original_function.call(client, this.metadata, {deadline: deadline});

    this.stream.on('error', () => {
    });
    this.stream.on('data', data => {
      if (this.queue[data.id]) {
        clearTimeout(this.queue[data.id]['timeout']);
        this.queue[data.id]['cb'](null, data);
        delete this.queue[data.id];
      }
    });
  }

  _nextId() {
    if (this.correlationId >= ClientDuplexStreamRequest.MAX_INT32) {
      this.correlationId = 0;
    }
    return this.correlationId++;
  }

  sendMetadata(metadata: Metadata): IClientDuplexStreamService<reqType, resType> {
    return this;
  }

  sendMessage(content: reqType = ({} as any)): Promise<resType> {
    return new Promise((resolve, reject) => {
      const id = this._nextId();

      if (this.stream.received_status) {
        return reject('stream_closed');
      }

      const cb = (err: Error, response?) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      };

      this.queue[id] = {
        cb,
        timeout: setTimeout(() => {
          delete this.queue[id];
          cb(new Error(`provider response timeout in ${this.timeout_message}`));
        }, this.timeout_message)
      };
      content['_id'] = id;
      this.stream.write(content);
    });
  }

  end(): void {
    return this.stream.end();
  }

}
