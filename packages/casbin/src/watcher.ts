import { Watcher } from 'casbin';

export abstract class BaseWatcher<Client> implements Watcher {
  private client: Client;
  private keyName: string;
  private callback: () => void;

  async init() {
    this.subscribeData(this.client, this.keyName, () => {
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
      await this.publishData(this.client, this.keyName);
      return true;
    } catch (err) {
      return false;
    }
  }

  abstract publishData(client: Client, keyName: string);
  abstract subscribeData(client: Client, keyName: string, callback);
}
