export * from './delegateTransport';
export { EmptyLogger, MidwayBaseLogger, MidwayDelegateLogger } from './logger';
export * from './interface';
import { MidwayLoggerContainer } from './container';

export const loggers = new MidwayLoggerContainer();
