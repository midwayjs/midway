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
    this.log.apply(this, args);
  }

  warn(...args) {
    this.log.apply(this, args);
  }

  info(...args) {
    this.log.apply(this, args);
  }

  error(...args) {
    this.log.apply(this, args);
  }

  debug(...args) {
    this.log.apply(this, args);
  }
}
