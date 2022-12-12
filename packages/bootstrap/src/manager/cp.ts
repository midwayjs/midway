import { ChildProcessEventBus } from '@midwayjs/event-bus';
import { Worker } from 'cluster';
import { ClusterOptions } from '../interface';
import { AbstractForkManager } from './base';
const cluster = require('cluster');
import { debuglog } from 'util';
import { isTypeScriptEnvironment } from '../util';

const debug = debuglog('midway:bootstrap');

export class ClusterManager extends AbstractForkManager<
  Worker,
  ClusterOptions
> {
  constructor(readonly options: ClusterOptions = {}) {
    super(options);
    options.args = options.args || [];
    options.execArgv = options.execArgv || [];
    if (isTypeScriptEnvironment()) {
      options.execArgv.push(...['--require', 'ts-node/register']);
    }
  }
  createWorker() {
    if (cluster['setupPrimary']) {
      cluster['setupPrimary'](this.options);
    } else if (cluster['setupMaster']) {
      cluster['setupMaster'](this.options);
    }
    return cluster.fork({
      MIDWAY_FORK_MODE: 'cluster',
      MIDWAY_STICKY_MODE: this.options.sticky ? 'true' : 'false',
      ...this.options.env,
    });
  }

  bindWorkerDisconnect(listener: (worker: Worker) => void) {
    debug('Bind cluster.disconnect event');
    cluster.on('disconnect', listener);
  }

  bindWorkerExit(listener: (worker: Worker, code, signal) => void) {
    debug('Bind cluster.exit event');
    cluster.on('exit', listener);
  }

  getWorkerId(worker: Worker) {
    return String(worker.process.pid);
  }

  isWorkerDead(worker: Worker) {
    return worker.isDead();
  }

  closeWorker(worker: Worker) {
    worker.kill('SIGTERM');
  }

  createEventBus(options) {
    return new ChildProcessEventBus(options) as any;
  }

  isPrimary(): boolean {
    return !cluster.isWorker;
  }
}
