import * as os from 'os';
import * as util from 'util';
import { logDate, sleep } from '../util';
import { EventEmitter, once } from 'events';
import { ForkOptions } from '../interface';
import type { IEventBus, EventBusOptions } from '@midwayjs/event-bus';
import { debuglog } from 'util';
const debug = debuglog('midway:bootstrap');

export abstract class AbstractForkManager<
  T,
  ClusterOptions extends ForkOptions
> {
  private reforks = [];
  private disconnectCount = 0;
  private unexpectedCount = 0;
  private disconnects = {};
  private hub = new EventEmitter();
  protected workers: Map<string, T> = new Map();
  protected eventBus: IEventBus<T>;
  private isClosing = false;
  private exitListener: () => void;

  protected constructor(readonly options: ClusterOptions) {
    options.count = options.count || os.cpus().length - 1;
    options.refork = options.refork !== false;
    options.limit = options.limit || 60;
    options.duration = options.duration || 60000; // 1 min
    options.logger = options.logger || console;
    options.workerInitTimeout = options.workerInitTimeout || 30000;
    this.eventBus = this.createEventBus({
      initTimeout: options.workerInitTimeout,
    });
  }

  public async start() {
    debug('Start manager with options: %j', this.options);
    this.bindWorkerDisconnect(worker => {
      debug(
        ' - worker(%s): trigger event = disconnect',
        this.getWorkerId(worker)
      );
      const log =
        this.options.logger[worker['disableRefork'] ? 'info' : 'error'];
      this.disconnectCount++;
      const isDead = this.isWorkerDead(worker);

      if (isDead) {
        debug(' - worker(%s): worker is dead', this.getWorkerId(worker));
        // worker has terminated before disconnect
        this.options.logger.info(
          "[%s] [bootstrap:master:%s] don't fork, because worker:%s exit event emit before disconnect",
          logDate(),
          process.pid,
          this.getWorkerId(worker)
        );
        return;
      }

      if (worker['disableRefork']) {
        debug(
          ' - worker(%s): worker is disableRefork(maybe terminated by master)',
          this.getWorkerId(worker)
        );
        // worker has terminated by master
        log(
          "[%s] [bootstrap:master:%s] don't fork, because worker:%s will be kill soon",
          logDate(),
          process.pid,
          this.getWorkerId(worker)
        );
        return;
      }

      this.disconnects[this.getWorkerId(worker)] = logDate();
      this.tryToRefork(worker);
    });

    this.bindWorkerExit((worker, code, signal) => {
      debug(' - worker(%s): trigger event = exit', this.getWorkerId(worker));
      // remove worker
      this.workers.delete(this.getWorkerId(worker));
      if (worker['disableRefork']) {
        return;
      }

      const isExpected = !!this.disconnects[this.getWorkerId(worker)];
      debug(
        ' - worker(%s): isExpected=%s',
        this.getWorkerId(worker),
        isExpected
      );

      if (isExpected) {
        delete this.disconnects[this.getWorkerId(worker)];
        // worker disconnect first, exit expected
        return;
      }

      debug(
        ' - worker(%s): isWorkerDead=%s',
        this.getWorkerId(worker),
        this.isWorkerDead(worker)
      );
      if (this.isWorkerDead(worker)) {
        return;
      }

      debug(' - worker(%s): unexpectedCount will add');

      this.unexpectedCount++;
      this.tryToRefork(worker);
      this.onUnexpected(worker, code, signal);
    });

    this.bindClose();

    this.hub.on('reachReforkLimit', this.onReachReforkLimit.bind(this));

    // defer to set the listeners
    // so you can listen this by your own
    setImmediate(() => {
      if (process.listeners('uncaughtException').length === 0) {
        process.on('uncaughtException', this.onerror.bind(this));
      }
    });

    for (let i = 0; i < this.options.count; i++) {
      const w = this.createWorker();
      debug(' - worker(%s) created', this.getWorkerId(w));
      this.eventBus.addWorker(w);
      this.workers.set(this.getWorkerId(w), w);
    }

    await this.eventBus.start();
  }

  protected tryToRefork(oldWorker: T) {
    if (this.allowRefork()) {
      debug(
        ' - worker(%s): allow refork and will fork new',
        this.getWorkerId(oldWorker)
      );
      const newWorker = this.createWorker(oldWorker);
      this.workers.set(this.getWorkerId(newWorker), newWorker);
      this.options.logger.info(
        '[%s] [bootstrap:master:%s] new worker:%s fork (state: %s)',
        logDate(),
        process.pid,
        this.getWorkerId(newWorker),
        newWorker['state']
      );
      this.eventBus.addWorker(newWorker);
    } else {
      debug(
        ' - worker(%s): forbidden refork and will stop',
        this.getWorkerId(oldWorker)
      );
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
    if (!this.options.refork || this.isClosing) {
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
    this.options.logger.error(
      '[%s] [bootstrap:master:%s] master uncaughtException: %s',
      logDate(),
      process.pid,
      err.stack
    );
    this.options.logger.error(err);
    this.options.logger.error(
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
        this.getWorkerId(worker),
        code,
        signal,
        propertyName,
        worker[propertyName],
        worker['state']
      )
    );
    err.name = 'WorkerDiedUnexpectedError';

    this.options.logger.error(
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
    this.options.logger.error(
      '[%s] [bootstrap:master:%s] worker died too fast (total %d disconnect, %d unexpected exit)',
      logDate(),
      process.pid,
      this.disconnectCount,
      this.unexpectedCount
    );
  }

  protected async killWorker(worker, timeout) {
    // kill process, if SIGTERM not work, try SIGKILL
    await this.closeWorker(worker);

    await Promise.race([once(worker, 'exit'), sleep(timeout)]);
    if (worker.killed) return;
    // SIGKILL: http://man7.org/linux/man-pages/man7/signal.7.html
    // worker: https://github.com/nodejs/node/blob/master/lib/internal/cluster/worker.js#L22
    // subProcess.kill is wrapped to subProcess.destroy, it will wait to disconnected.
    (worker.process || worker).kill('SIGKILL');
  }

  public async stop(timeout = 2000) {
    debug('run close');
    this.isClosing = true;
    await this.eventBus.stop();
    for (const worker of this.workers.values()) {
      worker['disableRefork'] = true;
      await this.killWorker(worker, timeout);
    }

    if (this.exitListener) {
      await this.exitListener();
    }
  }

  public hasWorker(workerId: string): boolean {
    return this.workers.has(workerId);
  }

  public getWorker(workerId: string): T {
    return this.workers.get(workerId);
  }

  public getWorkerIds(): string[] {
    return Array.from(this.workers.keys());
  }

  public onStop(exitListener) {
    this.exitListener = exitListener;
  }

  protected bindClose() {
    // kill(2) Ctrl-C
    process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
    // kill(3) Ctrl-\
    process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
    // kill(15) default
    process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));
    process.once('exit', this.onMasterExit.bind(this));
  }

  /**
   * on bootstrap receive a exit signal
   * @param signal
   */
  private async onSignal(signal) {
    if (!this.isClosing) {
      this.options.logger.info(
        '[bootstrap:master] receive signal %s, closing',
        signal
      );
      try {
        await this.stop();
        this.options.logger.info(
          '[bootstrap:master] close done, exiting with code:0'
        );
        process.exit(0);
      } catch (err) {
        this.options.logger.error('[midway:master] close with error: ', err);
        process.exit(1);
      }
    }
  }

  /**
   * on bootstrap process exit
   * @param code
   */
  private onMasterExit(code) {
    this.options.logger.info('[bootstrap:master] exit with code:%s', code);
  }

  abstract createWorker(oldWorker?: T): T;
  abstract bindWorkerDisconnect(listener: (worker: T) => void): void;
  abstract bindWorkerExit(listener: (worker: T, code, signal) => void): void;
  abstract getWorkerId(worker: T): string;
  abstract isWorkerDead(worker: T): boolean;
  abstract closeWorker(worker: T);
  abstract createEventBus(eventBusOptions: EventBusOptions): IEventBus<T>;
  abstract isPrimary(): boolean;
}
