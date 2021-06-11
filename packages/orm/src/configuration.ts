import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Configuration, listModule, Config } from '@midwayjs/decorator';
import {
  createConnection,
  getConnection,
  getRepository,
  ConnectionOptions,
  Connection,
} from 'typeorm';
import {
  ENTITY_MODEL_KEY,
  EVENT_SUBSCRIBER_KEY,
  CONNECTION_KEY,
  ORM_MODEL_KEY,
} from '.';
import { ORM_HOOK_KEY, OrmConnectionHook } from './hook';
import { join } from 'path';

@Configuration({
  importConfigs: [join(__dirname, './config')],
  namespace: 'orm',
})
export class OrmConfiguration implements ILifeCycle {
  @Config('orm')
  private ormConfig: any;

  private connectionNames: string[] = [];

  async onReady(container: IMidwayContainer) {
    (container as any).registerDataHandler(
      ORM_MODEL_KEY,
      (key: { modelKey; connectionName }) => {
        // return getConnection(key.connectionName).getRepository(key.modelKey);
        const repo = getRepository(key.modelKey, key.connectionName);
        return repo;
      }
    );

    const entities = listModule(ENTITY_MODEL_KEY);
    const eventSubs = listModule(EVENT_SUBSCRIBER_KEY);

    const opts = this.formatConfig();

    for (const connectionOption of opts) {
      connectionOption.entities = entities || [];
      connectionOption.subscribers = eventSubs || [];
      const name = connectionOption.name || 'default';
      this.connectionNames.push(name);
      let isConnected = false;
      try {
        const conn = getConnection(name);
        if (conn.isConnected) {
          isConnected = true;
        }
      } catch {}
      if (!isConnected) {
        const rtOpt = await this.beforeCreate(container, connectionOption);
        const con = await createConnection(rtOpt);
        await this.afterCreate(container, rtOpt, con);
      }
    }

    container.registerObject(CONNECTION_KEY, instanceName => {
      if (!instanceName) {
        instanceName = 'default';
      }
      return getConnection(instanceName);
    });
  }

  async onStop(container: IMidwayContainer) {
    await Promise.all(
      Object.values(this.connectionNames).map(async connectionName => {
        const conn = getConnection(connectionName);

        await this.beforeClose(container, conn, connectionName);

        if (conn.isConnected) {
          await conn.close();
        }

        await this.afterClose(container, conn);
      })
    );

    this.connectionNames.length = 0;
  }

  formatConfig(): any[] {
    const originConfig = this.ormConfig;
    if (originConfig?.type) {
      originConfig.name = 'default';
      return [originConfig];
    } else {
      const newArr = [];

      for (const [key, value] of Object.entries(originConfig)) {
        (value as any).name = key;
        newArr.push(value);
      }

      return newArr;
    }
  }

  /**
   * 创建 connection 之前
   * @param container
   * @param opts
   */
  private async beforeCreate(
    container: IMidwayContainer,
    opts: ConnectionOptions
  ): Promise<ConnectionOptions> {
    let rt = opts;
    const clzzs = listModule(ORM_HOOK_KEY);
    for (const clzz of clzzs) {
      const inst: OrmConnectionHook = await container.getAsync(clzz);
      if (inst.beforeCreate && typeof inst.beforeCreate === 'function') {
        rt = await inst.beforeCreate(rt);
      }
    }
    return rt;
  }
  /**
   * 创建 connection 之后
   * @param container
   * @param opts
   * @param con
   */
  private async afterCreate(
    container: IMidwayContainer,
    opts: ConnectionOptions,
    con: Connection
  ): Promise<Connection> {
    let rtCon: Connection = con;
    const clzzs = listModule(ORM_HOOK_KEY);
    for (const clzz of clzzs) {
      const inst: OrmConnectionHook = await container.getAsync(clzz);
      if (inst.afterCreate && typeof inst.afterCreate === 'function') {
        rtCon = await inst.afterCreate(con, opts);
      }
    }
    return rtCon;
  }
  /**
   * 关闭连接之前
   * @param container
   * @param con
   * @param connectionName
   */
  private async beforeClose(
    container: IMidwayContainer,
    con: Connection,
    connectionName: string
  ) {
    let rt = con;
    const clzzs = listModule(ORM_HOOK_KEY);
    for (const clzz of clzzs) {
      const inst: OrmConnectionHook = await container.getAsync(clzz);
      if (inst.beforeClose && typeof inst.beforeClose === 'function') {
        rt = await inst.beforeClose(rt, connectionName);
      }
    }
    return rt;
  }
  /**
   * 关闭连接之后
   * @param container
   * @param con
   */
  private async afterClose(container: IMidwayContainer, con: Connection) {
    let rt = con;
    const clzzs = listModule(ORM_HOOK_KEY);
    for (const clzz of clzzs) {
      const inst: OrmConnectionHook = await container.getAsync(clzz);
      if (inst.afterClose && typeof inst.afterClose === 'function') {
        rt = await inst.afterClose(rt);
      }
    }
    return rt;
  }
}
