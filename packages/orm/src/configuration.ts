import {
  ILifeCycle,
  IMidwayApplication,
  IMidwayContainer,
  MidwayFrameworkService,
} from '@midwayjs/core';
import {
  App,
  Config,
  Configuration,
  getClassMetadata,
  Init,
  Inject,
  listModule,
} from '@midwayjs/decorator';
import { join } from 'path';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  getRepository,
} from 'typeorm';
import {
  CONNECTION_KEY,
  ENTITY_MODEL_KEY,
  EVENT_SUBSCRIBER_KEY,
  ORM_MODEL_KEY,
} from '.';
import { OrmConnectionHook, ORM_HOOK_KEY } from './hook';

@Configuration({
  importConfigs: [join(__dirname, './config')],
  namespace: 'orm',
})
export class OrmConfiguration implements ILifeCycle {
  @Config('orm')
  private ormConfig: any;

  @App()
  app: IMidwayApplication;

  private connectionNames: string[] = [];

  @Inject()
  frameworkService: MidwayFrameworkService;

  @Init()
  async init() {
    this.frameworkService.registerHandler(
      ORM_MODEL_KEY,
      (
        propertyName,
        meta: {
          modelKey: string;
          connectionName: string;
        }
      ) => {
        // return getConnection(key.connectionName).getRepository(key.modelKey);
        return getRepository(meta.modelKey, meta.connectionName);
      }
    );
  }

  async onReady(container: IMidwayContainer) {
    const entities = listModule(ENTITY_MODEL_KEY);
    const eventSubs = listModule(EVENT_SUBSCRIBER_KEY);

    const connectionNameMap = { ALL: [] };
    for (const entity of entities) {
      const _connectionName = getClassMetadata(
        ENTITY_MODEL_KEY,
        entity
      ).connectionName;
      if (!connectionNameMap[_connectionName]) {
        connectionNameMap[_connectionName] = [];
      }
      connectionNameMap[_connectionName].push(entity);
    }

    const opts = this.formatConfig();

    for (const connectionOption of opts) {
      const name = connectionOption.name || 'default';
      const connectionEntities = [
        ...connectionNameMap['ALL'],
        ...(connectionNameMap[name] || []),
      ];

      connectionOption.entities = connectionOption.entities
        ? connectionOption.entities
        : connectionEntities || [];

      connectionOption.subscribers = eventSubs || [];
      this.connectionNames.push(name);
      let isConnected = false;
      try {
        const conn = getConnection(name);
        if (conn.isConnected) {
          isConnected = true;
        }
      } catch {
        /* ignore */
      }
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

    // get event model
    const eventModules = listModule(EVENT_SUBSCRIBER_KEY);
    for (const eventModule of eventModules) {
      const eventModuleMetadata = getClassMetadata(
        EVENT_SUBSCRIBER_KEY,
        eventModule
      );
      const module = await container.getAsync(eventModule);
      getConnection(
        eventModuleMetadata.connectionName || 'default'
      ).subscribers.push(module);
    }
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
