import { Logger, FileTransport } from 'egg-logger';
import { IServerlessLogger } from '../interface';
import * as util from 'util';
import fs = require('mz/fs');

const DEFAULT_MAX_FILE = 2;
const DEFAULT_MAX_FILE_SIZE = 1e8; // bytes, 100MB
const DEFAULT_INTERVAL = 600 * 1000; // 10min

const debuglog = util.debuglog('RuntimeEngine:Logger');

export class ServerlessLogger extends Logger implements IServerlessLogger {
  options;

  constructor(options) {
    super(options);
    if (options.file) {
      this.set(
        'file',
        new FileTransport({
          file: options.file,
          level: options.level || 'INFO',
        })
      );
      this.startLogRotateBySize();
    }
  }

  write(...args: [string, ...any[]]) {
    let msg = args[0];
    if (args.length > 1) {
      msg = util.format(...args);
    }
    // tracing use ALL level, but write default is NONE, will not output
    this.log(this.options.level === 'ALL' ? 'ALL' : 'NONE', [msg], {
      raw: true,
    });
  }

  get defaults() {
    return {
      file: null,
      encoding: 'utf8',
      level: 'INFO',
      consoleLevel: 'NONE',
      buffer: true,
    };
  }

  protected async startLogRotateBySize(): Promise<void> {
    const size = 100;
    while (true) {
      const dealyMs =
        this.options.fileClearInterval ||
        Number(process.env.LOG_ROTATE_INTERVAL) ||
        DEFAULT_INTERVAL;
      debuglog(`will rotate by size after ${dealyMs}ms, size: ${size}`);
      await this.delayOnOptimisticLock(dealyMs);
      /* istanbul ignore next */
      await this.rotateLogBySize();
    }
  }

  /**
   * Produce a delay on an optimistic lock, optimistic lock can broke this delay
   * @param ms
   * @return {Promise<any>}
   */
  protected delayOnOptimisticLock(ms): Promise<any> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * A cycle to find out which log file needs to cut
   * @return {Promise<void>}
   */
  protected async rotateLogBySize(): Promise<void> {
    try {
      const maxFileSize =
        this.options.maxFileSize ||
        Number(process.env.LOG_ROTATE_FILE_SIZE) ||
        DEFAULT_MAX_FILE_SIZE;
      const transport: any = this.get('file');
      if (transport._stream && transport._stream.writable) {
        const stat = await fs.fstat(transport._stream.fd);
        if (stat.size >= maxFileSize) {
          this.info(
            `File ${transport._stream.path} (fd ${transport._stream.fd}) reach the maximum file size, current size: ${stat.size}, max size: ${maxFileSize}`
          );
          await this.rotateBySize();
        }
      }
    } catch (e) {
      e.message = `${e.message}`;
      this.error(e);
    }
  }

  /**
   * Cut log file by size
   * @param {RotationStrategy} strategy
   * @return {Promise<void>}
   */
  protected async rotateBySize(): Promise<void> {
    const logfile = this.options.file;
    const maxFiles =
      this.options.maxFiles ||
      Number(process.env.LOG_ROTATE_MAX_FILE_NUM) ||
      DEFAULT_MAX_FILE;
    const exists = await fs.exists(logfile);
    if (!exists) {
      return;
    }
    // remove max
    const maxFileName = `${logfile}.${maxFiles}`;
    const maxExists = await fs.exists(maxFileName);
    if (maxExists) {
      await fs.unlink(maxFileName);
    }
    // 2->3, 1->2
    for (let i = maxFiles - 1; i >= 1; i--) {
      await this.renameOrDelete(`${logfile}.${i}`, `${logfile}.${i + 1}`);
    }
    // logfile => logfile.1
    await fs.rename(logfile, `${logfile}.1`);
    this.reload();
  }

  /**
   * If file exist, try backup. If backup filed, remove it.
   * This operation for the file size cutting only.
   * @param targetPath
   * @param backupPath
   * @return {Promise<void>}
   */
  protected async renameOrDelete(targetPath, backupPath): Promise<void> {
    const targetExists = await fs.exists(targetPath);
    if (!targetExists) {
      return;
    }
    const backupExists = await fs.exists(backupPath);
    /* istanbul ignore if */
    if (backupExists) {
      await fs.unlink(targetPath);
    } else {
      await fs.rename(targetPath, backupPath);
    }
  }
}
