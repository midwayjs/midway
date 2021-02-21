import { Metadata } from '@grpc/grpc-js';
import { IClientWritableStreamService } from '../../interface';

export class ClientWritableRequest<reqType, resType>
  implements IClientWritableStreamService<reqType, resType> {
  client;
  metadata;
  timeout;
  stream;
  promise;

  constructor(
    client,
    original_function,
    options: {
      metadata?: Metadata;
      timeout?: number;
    } = {}
  ) {
    this.promise = new Promise((resolve, reject) => {
      // Deadline is advisable to be set
      // It should be a timestamp value in milliseconds
      let deadline = undefined;
      if (options.timeout !== undefined) {
        deadline = Date.now() + options.timeout;
      }
      this.metadata = options.metadata || new Metadata();
      this.stream = original_function.call(
        client,
        this.metadata,
        { deadline: deadline },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  sendMessage(
    content: reqType
  ): IClientWritableStreamService<reqType, resType> {
    this.stream.write(content);
    return this;
  }

  end(): Promise<resType> {
    this.stream.end();
    return this.promise;
  }

  getCall() {
    return this.stream;
  }
}
