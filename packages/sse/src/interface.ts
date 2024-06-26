export type EventData = string | object;

export interface MessageEvent {
  data?: EventData;
  event?: string;
  id?: string;
  retry?: number;
}

export interface ServerSendEventStreamOptions {
  closeEvent?: string;
}
