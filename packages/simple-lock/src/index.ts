const DEFAULT_KEY = '_default_simple_lock_queue';

class Item {
  key: string;
  fns: any[];
  resolved: boolean;

  constructor(key?: string) {
    this.key = key;
    this.fns = [];
    this.resolved = false;
  }
}

class Queue {
  qs: any;

  constructor() {
    this.qs = {};
  }

  has(key: string): boolean {
    return !!this.qs[key];
  }

  get(key: string): Item {
    return this.qs[key];
  }

  reset(key: string): void {
    this.qs[key] = new Item(key);
  }
}

export default class SimpleLock {
  private q: Queue;

  constructor() {
    this.q = new Queue();
  }
  /**
   * only execute once
   * @param fn function
   * @param key lock key
   */
  async sureOnce(fn: () => Promise<void>, key?: string): Promise<void> {
    const localKey = key || DEFAULT_KEY;
    let deferredResolve = null;
    let deferredReject = null;

    const deferred = new Promise<void>((resolve, reject) => {
      deferredResolve = resolve;
      deferredReject = reject;
    });

    const exec = () => {
      if (!this.q.get(localKey).resolved) {
        Promise.resolve(fn()).then(ret => {
          deferredResolve(ret);

          if (this.q.get(localKey).fns.length > 0) {
            this.q.get(localKey).fns.shift()();
          }
        }).catch(err => {
          deferredReject(err);
        });

        this.q.get(localKey).resolved = true;
      } else {
        deferredResolve();

        if (this.q.get(localKey).fns.length > 0) {
          this.q.get(localKey).fns.shift()();
        }
      }
    };

    if (!this.q.has(localKey)) {
      this.q.reset(localKey);
      exec();
    } else {
      this.q.get(localKey).fns.push(() => exec());
    }

    return deferred;
  }
  /**
   * async lock
   * @param key lock key
   * @param fn exec function
   */
  async acquire(key: string, fn: () => Promise<any>): Promise<any> {
    let deferredResolve = null;
    let deferredReject = null;

    const deferred = new Promise<any>((resolve, reject) => {
      deferredResolve = resolve;
      deferredReject = reject;
    });

    const exec = () => {
      // run fn
      Promise.resolve(fn()).then(ret => {
        deferredResolve(ret);

        if (this.q.get(key).fns.length > 0) {
          this.q.get(key).fns.shift()();
        }

        this.q.get(key).resolved = true;
      }).catch(err => {
        deferredReject(err);

        this.q.get(key).resolved = true;
      });
    };

    if (!this.q.has(key)) {
      this.q.reset(key);
      exec();
    } else {
      this.q.get(key).fns.push(() => exec());
    }

    return deferred;
  }

  releaseLock(key?: string): void {
    const localKey = key || DEFAULT_KEY;
    this.q.reset(localKey);
  }
}
