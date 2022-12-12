import { Watcher } from 'casbin';
import Redis from 'ioredis';

export abstract class BaseWatcher<Client> implements Watcher {
  private callback: () => void;

  constructor(
    protected options: {
      subClient: Client;
      pubClient?: Client;
      subscribeKeyName?: string;
    }
  ) {
    this.options.subscribeKeyName =
      this.options.subscribeKeyName || this.getDefaultSubscribeKeyName();
    if (!this.options.pubClient) {
      this.options.pubClient = this.options.subClient;
    }
    this.subscribeData(() => {
      if (this.callback) {
        this.callback();
      }
    });
  }

  setUpdateCallback(callback: () => void) {
    this.callback = callback;
  }
  async update(): Promise<boolean> {
    try {
      await this.publishData();
      return true;
    } catch (err) {
      return false;
    }
  }

  abstract publishData();
  abstract subscribeData(callback);
  protected async close() {}

  getDefaultSubscribeKeyName(): string {
    return 'casbin-data-sync';
  }
}

export class NodeRedisWatcher extends BaseWatcher<Redis> {
  async publishData() {
    await this.options.pubClient.publish(
      this.options.subscribeKeyName,
      'casbin rules updated'
    );
  }

  async subscribeData(callback) {
    await this.options.subClient.subscribe(this.options.subscribeKeyName);
    this.options.subClient.on('message', channel => {
      if (channel !== this.options.subscribeKeyName) {
        return;
      }
      callback();
    });
  }
}
