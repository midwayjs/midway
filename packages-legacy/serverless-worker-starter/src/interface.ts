import { Readable, Writable } from "stream";

// Node.js environment: WorkerContext, IncomingMessage, OutgoingMessage
// Serverless worker environment: FetchEvent
export type WorkerEntryRequest = FetchEvent[];
export type NodeEntryRequest = [WorkerContext, IncomingMessage, ServerResponse];
export type EntryRequest = WorkerEntryRequest | NodeEntryRequest;

export const EVENT_INVOKE_METHOD = ['alice-event-invoke', 'noslated-event-invoke'];

export interface DaprResponse {
  status: number;
  json(): Promise<object>;
  text(): Promise<string>;
  buffer(): Promise<Buffer>;
}

export interface DaprInvokeOptions {
  app: string;
  methodName: string;
  data: Buffer;
}

export interface DaprBindingOptions {
  name: string;
  metadata: Record<string, string>;
  operation: string;
  data: Buffer;
}

export interface WorkerContext {
  Dapr: {
    ['1.0']: {
      invoke: (req: DaprInvokeOptions) => Promise<DaprResponse>;
      binding: (req: DaprBindingOptions) => Promise<DaprResponse>;
    };
  };
}

export interface IncomingMessage extends Readable {
  readonly url: string;
  readonly method: string;
  readonly headers: Record<string, string>;
  readonly rawHeaders: string[];
}

export interface ServerResponse extends Writable {
  readonly headerSent: boolean;
  statusCode: number;
  readonly statusMessage: string;
  flushHeaders(): void;
  getHeader(name: string): string | string[];
  getHeaderNames(): string[];
  hasHeader(name: string): boolean;
  removeHeader(name: string): void;
  setHeader(name: string, value: string): void;
  writeHead(status: number, headers: Record<string, string> | string[]): void;
}
