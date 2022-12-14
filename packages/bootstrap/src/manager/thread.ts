import { ThreadOptions } from '../interface';
import { AbstractForkManager } from './base';
import { Worker, isMainThread, SHARE_ENV } from 'worker_threads';
import { ThreadEventBus } from '@midwayjs/event-bus';
import { isTypeScriptEnvironment } from '../util';

export class ThreadManager extends AbstractForkManager<Worker, ThreadOptions> {
  private workerExitListener;
  constructor(readonly options: ThreadOptions = {}) {
    super(options);
    options.argv = options.argv || [];
    options.execArgv = options.execArgv || [];
    process.env.MIDWAY_FORK_MODE = 'thread';
  }
  createWorker() {
    let w: Worker;
    let content = `
    require(${JSON.stringify(this.options.exec)});
  `;
    // 当前是 ts 环境
    if (isTypeScriptEnvironment()) {
      content = `
    require("ts-node/register/transpile-only");
    ${content}
    `;

      w = new Worker(content, { eval: true, env: SHARE_ENV });
      w['_originThreadId'] = String(w.threadId);
      this.options.logger.info(
        'new worker thread with ts-node, threadId = %s.',
        this.getWorkerId(w)
      );
    } else {
      w = new Worker(content, { eval: true, env: SHARE_ENV });
      this.options.logger.info(
        'new worker thread, threadId = %s.',
        this.getWorkerId(w)
      );
    }

    w.on('exit', code => {
      this.workerExitListener(w, code);
    });

    return w;
  }

  bindWorkerDisconnect(listener: (worker: Worker) => void) {
    // this.disconnectListener = listener;
  }

  bindWorkerExit(listener: (worker: Worker, code, signal) => void) {
    this.workerExitListener = listener;
  }

  getWorkerId(worker: Worker) {
    return worker['_originThreadId'] || String(worker.threadId);
  }

  isWorkerDead(worker: Worker) {
    return false;
  }

  async closeWorker(worker: Worker) {
    await worker.terminate();
  }

  createEventBus(options) {
    return new ThreadEventBus(options) as any;
  }

  isPrimary(): boolean {
    return isMainThread;
  }
}
