/* istanbul ignore file */
import { isDebug } from '../util';

export class DebugLogger {
  prefix;
  isDebugEnv;

  constructor(prefix?) {
    this.prefix = prefix || '';
    this.isDebugEnv = isDebug();
  }

  log(...args) {
    if (this.isDebugEnv) {
      if (this.prefix) {
        console.log(`[faas_debug:${this.prefix}]`, args);
      } else {
        console.log('[faas_debug]', args);
      }
    }
  }

  write(...args) {
    this.log(...args);
  }

  warn(...args) {
    this.log(...args);
  }

  info(...args) {
    this.log(...args);
  }

  error(...args) {
    this.log(...args);
  }

  debug(...args) {
    this.log(...args);
  }
}
