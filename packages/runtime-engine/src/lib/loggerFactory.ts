import { join } from 'path';
import { ServerlessLogger } from './logger';
import { LoggerFactory, PropertyParser } from '../interface';

export class BaseLoggerFactory implements LoggerFactory {
  homeDir: string;
  baseDir: string;
  Logger: any;
  envParser: PropertyParser<string>;

  constructor(
    homeDir: string,
    envParser?: PropertyParser<string>,
    Logger?: any
  ) {
    this.homeDir = homeDir;
    this.baseDir = join(this.homeDir, 'logs');
    this.envParser = envParser;
    this.Logger = Logger || ServerlessLogger;
  }

  createLogger(options?);
  createLogger(filename?, options?) {
    if (typeof filename === 'string') {
      options = options || {};
      options.file = filename;
    } else {
      options = filename || {};
    }
    options = options || {};
    const lv = this.envParser ? this.envParser.getLoggerLevel() : 'ERROR';
    if (lv) {
      options.level = lv;
      options.consoleLevel = lv;
    }
    const Logger = this.Logger;
    const logger = new Logger(
      Object.assign({}, options, {
        file: options.file ? join(this.baseDir, options.file) : undefined,
        baseDir: this.baseDir,
      })
    );

    return logger;
  }
}
