import { FileLogger, Logger, QueryRunner } from 'typeorm';

export class TypeORMLogger extends FileLogger implements Logger {
  constructor(readonly typeormLogger: any) {
    super(true);
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.typeormLogger.debug(message);
        break;
      case 'info':
        this.typeormLogger.info(message);
        break;
      case 'warn':
        this.typeormLogger.warn(message);
        break;
    }
  }

  write(strings: string | string[]) {
    this.typeormLogger.info(strings);
  }
}
