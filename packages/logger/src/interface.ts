export interface ILogger {
  log?(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  write?(msg: string): void;
}
