import { RedisServiceFactory } from '@midwayjs/redis';
import { IMidwayContainer } from '@midwayjs/core';
import { Watcher } from 'casbin';
import Redis from 'ioredis';

export abstract class BaseWatcher<Client> implements Watcher {
  private callback: () => void;

  constructor(protected client: Client, protected keyName?: string) {
    this.keyName = keyName || this.getDefaultKeyName();
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

  getDefaultKeyName(): string {
    return 'casbin';
  }
}

export class NodeRedisWatcher extends BaseWatcher<Redis> {
  async publishData() {
    await this.client.publish(this.keyName, 'casbin rules updated');
  }

  subscribeData(callback) {
    this.client.subscribe(this.keyName);
    this.client.on('message', (chan: string) => {
      if (chan !== this.keyName) {
        return;
      }
      callback();
    });
  }
}

export function createWatcher(options: {
  clientName: string;
  keyName: string;
}) {
  return async (container: IMidwayContainer) => {
    const redisServiceFactory = await container.getAsync(RedisServiceFactory);
    const redisInstance = redisServiceFactory.get(options.clientName);
    return new NodeRedisWatcher(redisInstance, options.keyName);
  };
}
