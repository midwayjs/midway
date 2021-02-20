import { Metadata } from '@grpc/grpc-js';
import { IClientReadableStreamService } from '../../interface';

export class ClientReadableRequest<reqType, resType> implements IClientReadableStreamService<reqType, resType> {

  client;
  metadata;
  timeout;
  stream;
  queue;
  original_function;

  constructor(client, original_function, options: {
    metadata?: Metadata;
    timeout?: number;
  } = {}) {
    this.queue = [];
    this.client = client;
    this.metadata = options.metadata || new Metadata();
    this.timeout = options.timeout || undefined;
    this.original_function = original_function;
  }

  sendMessage(content: reqType): Promise<resType[]> {
    return new Promise((resolve, reject) => {
      // Deadline is advisable to be set
      // It should be a timestamp value in milliseconds
      let deadline = undefined;
      if (this.timeout !== undefined) {
        deadline = Date.now() + this.timeout;
      }
      this.stream = this.original_function.call(this.client, content, this.metadata, {deadline: deadline});
      this.stream.on('error', error => {
        reject(error);
      });
      this.stream.on('data', data => {
        this.queue.push(data);
      });
      this.stream.on('end', () => {
        resolve(this.queue);
      });
    });
  }

  getCall() {
    return this.stream;
  }

}
