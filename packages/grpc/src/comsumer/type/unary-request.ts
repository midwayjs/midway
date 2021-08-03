import { Metadata, ClientUnaryCall } from '@grpc/grpc-js';
import { IClientUnaryService } from '../../interface';

export class ClientUnaryRequest<reqType, resType>
  implements IClientUnaryService<reqType, resType>
{
  client;
  metadata;
  timeout;
  original_function;

  constructor(
    client,
    original_function,
    options: {
      metadata?: Metadata;
      timeout?: number;
    } = {}
  ) {
    this.client = client;
    this.metadata = options.metadata || new Metadata();
    this.timeout = options.timeout || undefined;
    this.original_function = original_function;
  }

  sendMessage(
    content: reqType,
    handler?: (call: ClientUnaryCall) => void
  ): Promise<resType> {
    return new Promise<resType>((resolve, reject) => {
      // Deadline is advisable to be set
      // It should be a timestamp value in milliseconds
      let deadline = undefined;
      if (this.timeout !== undefined) {
        deadline = Date.now() + this.timeout;
      }
      const call = this.original_function.call(
        this.client,
        content,
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
      handler && handler(call);
    });
  }

  sendMessageWithCallback(content: reqType, callback): ClientUnaryCall {
    // Deadline is advisable to be set
    // It should be a timestamp value in milliseconds
    let deadline = undefined;
    if (this.timeout !== undefined) {
      deadline = Date.now() + this.timeout;
    }
    return this.original_function.call(
      this.client,
      content,
      this.metadata,
      { deadline: deadline },
      callback
    );
  }
}
