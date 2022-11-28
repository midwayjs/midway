import { Worker } from 'cluster';
const cluster = require('cluster');
import * as os from 'os';
import * as util from 'util';
import { logDate } from '../util';
import { EventEmitter } from 'events';
import { ClusterOptions, ForkOptions } from '../interface';

export abstract class AbstractFork<T, ClusterOptions extends ForkOptions> {
  private reforks = [];
  private disconnectCount = 0;
  private unexpectedCount = 0;
  private disconnects = {};
  private hub = new EventEmitter();

  protected constructor(readonly options: ClusterOptions) {
    options.count = options.count || os.cpus().length - 1;
    options.refork = options.refork !== false;
    options.limit = options.limit || 60;
    options.duration = options.duration || 60000; // 1 min
    options.logger = options.logger || console;
  }

  public async start() {
    this.bindWorkerDisconnect(worker => {
      this.disconnectCount++;
      const isDead = this.isWorkerDead(worker);

      if (isDead) {
        // worker has terminated before disconnect
        this.options.logger.info(
          "[%s] [bootstrap:master:%s] don't fork, because worker:%s exit event emit before disconnect",
          logDate(),
          process.pid,
          this.getWorkerPid(worker)
        );
        return;
      }

      this.disconnects[this.getWorkerPid(worker)] = logDate();
      this.tryToRefork(worker);
    });

    this.bindWorkerExit((worker, code, signal) => {
      const isExpected = !!this.disconnects[this.getWorkerPid(worker)];

      if (isExpected) {
        delete this.disconnects[this.getWorkerPid(worker)];
        // worker disconnect first, exit expected
        return;
      }

      this.unexpectedCount++;
      this.tryToRefork(worker);
      this.onUnexpected(worker, code, signal);
    });

    this.hub.on('reachReforkLimit', this.onReachReforkLimit.bind(this));

    // defer to set the listeners
    // so you can listen this by your own
    setImmediate(() => {
      if (process.listeners('uncaughtException').length === 0) {
        process.on('uncaughtException', this.onerror.bind(this));
      }
    });

    for (let i = 0; i < this.options.count; i++) {
      this.createWorker();
    }
  }

  protected tryToRefork(oldWorker: T) {
    if (this.allowRefork()) {
      const newWorker = this.createWorker(oldWorker);
      this.options.logger.info(
        '[%s] [bootstrap:master:%s] new worker:%s fork (state: %s)',
        logDate(),
        process.pid,
        this.getWorkerPid(newWorker),
        newWorker['state']
      );
    } else {
      this.options.logger.info(
        "[%s] [bootstrap:master:%s] don't fork new work (refork: %s)",
        logDate(),
        process.pid,
        this.options.refork
      );
    }
  }

  /**
   * allow refork
   */
  protected allowRefork() {
    if (!this.options.refork) {
      return false;
    }

    const times = this.reforks.push(Date.now());

    if (times > this.options.limit) {
      this.reforks.shift();
    }

    const span = this.reforks[this.reforks.length - 1] - this.reforks[0];
    const canFork =
      this.reforks.length < this.options.limit || span > this.options.duration;

    if (!canFork) {
      this.hub.emit('reachReforkLimit');
    }

    return canFork;
  }

  /**
   * uncaughtException default handler
   */
  protected onerror(err) {
    if (!err) {
      return;
    }
    console.error(
      '[%s] [bootstrap:master:%s] master uncaughtException: %s',
      logDate(),
      process.pid,
      err.stack
    );
    console.error(err);
    console.error(
      '(total %d disconnect, %d unexpected exit)',
      this.disconnectCount,
      this.unexpectedCount
    );
  }

  /**
   * unexpectedExit default handler
   */
  protected onUnexpected(worker: T, code, signal) {
    // eslint-disable-next-line no-prototype-builtins
    const propertyName = worker.hasOwnProperty('exitedAfterDisconnect')
      ? 'exitedAfterDisconnect'
      : 'suicide';
    const err = new Error(
      util.format(
        'worker:%s died unexpected (code: %s, signal: %s, %s: %s, state: %s)',
        this.getWorkerPid(worker),
        code,
        signal,
        propertyName,
        worker[propertyName],
        worker['state']
      )
    );
    err.name = 'WorkerDiedUnexpectedError';

    console.error(
      '[%s] [bootstrap:master:%s] (total %d disconnect, %d unexpected exit) %s',
      logDate(),
      process.pid,
      this.disconnectCount,
      this.unexpectedCount,
      err.stack
    );
  }

  /**
   * reachReforkLimit default handler
   */

  protected onReachReforkLimit() {
    console.error(
      '[%s] [bootstrap:master:%s] worker died too fast (total %d disconnect, %d unexpected exit)',
      logDate(),
      process.pid,
      this.disconnectCount,
      this.unexpectedCount
    );
  }

  protected async killWorker(worker, timeout) {
    // kill process, if SIGTERM not work, try SIGKILL
    worker.kill('SIGTERM');
    // await Promise.race([
    //   awaitEvent(worker, 'exit'),
    //   sleep(timeout),
    // ]);
    if (worker.killed) return;
    // SIGKILL: http://man7.org/linux/man-pages/man7/signal.7.html
    // worker: https://github.com/nodejs/node/blob/master/lib/internal/cluster/worker.js#L22
    // subProcess.kill is wrapped to subProcess.destroy, it will wait to disconnected.
    (worker.process || worker).kill('SIGKILL');
  }

  abstract createWorker(oldWorker?: T): T;
  abstract bindWorkerDisconnect(listener: (worker: T) => void): void;
  abstract bindWorkerExit(listener: (worker: T, code, signal) => void): void;
  abstract getWorkerPid(worker: T): string;
  abstract isWorkerDead(worker: T): boolean;
  abstract close();
}

export class ClusterFork extends AbstractFork<Worker, ClusterOptions> {
  constructor(readonly options: ClusterOptions = {}) {
    super(options);
    options.args = options.args || [];
    options.execArgv = options.execArgv || [];

    // https://github.com/gotwarlost/istanbul#multiple-process-usage
    if (process.env.running_under_istanbul) {
      // use coverage for forked process
      // disabled reporting and output for child process
      // enable pid in child process coverage filename
      let args = [
        'cover',
        '--report',
        'none',
        '--print',
        'none',
        '--include-pid',
        options.exec,
      ];
      if (options.args && options.args.length > 0) {
        args.push('--');
        args = args.concat(options.args);
      }

      options.exec = './node_modules/.bin/istanbul';
      options.args = args;
    }
  }
  createWorker(oldWorker?) {
    const options = oldWorker?.['_clusterSettings'] || this.options;
    if (options) {
      if (cluster['setupPrimary']) {
        cluster['setupPrimary'](options);
      } else if (cluster['setupMaster']) {
        cluster['setupMaster'](options);
      }
    }
    const worker = cluster.fork();
    worker['_clusterSettings'] = cluster.settings;
    return worker;
  }

  bindWorkerDisconnect(listener: (worker: Worker) => void) {
    cluster.on('disconnect', listener);
  }

  bindWorkerExit(listener: (worker: Worker, code, signal) => void) {
    cluster.on('exit', listener);
  }

  getWorkerPid(worker: Worker) {
    return String(worker.process.pid);
  }

  isWorkerDead(worker: Worker) {
    return worker.isDead();
  }

  public async close(timeout = 1000) {
    for (const worker of Object.values(cluster.workers)) {
      await this.killWorker(worker, timeout);
    }
  }
}
