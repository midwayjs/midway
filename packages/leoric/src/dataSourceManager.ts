import {
  Config,
  DataSourceManager,
  ILogger,
  Init,
  Inject,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  listModule,
} from '@midwayjs/core';
import Realm, { isBone } from 'leoric';
import path from 'path';
import fs from 'fs/promises';

async function loadModels(baseDir: string) {
  if (!baseDir || typeof baseDir !== 'string') {
    throw new Error(`Unexpected models dir (${baseDir})`);
  }
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const models = [];

  for (const entry of entries) {
    const extname = path.extname(entry.name);
    if (entry.isFile() && ['.js', '.mjs', '.ts', '.mts'].includes(extname)) {
      const exports = require(path.join(baseDir, entry.name));
      const model = exports.__esModule ? exports.default : exports;
      if (isBone(model)) models.push(model);
    }
  }

  return models;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class LeoricDataSourceManager extends DataSourceManager<Realm> {
  @Config('leoric')
  leoricConfig;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Inject()
  baseDir: string;

  @Init()
  async init() {
    await this.initDataSource(this.leoricConfig, this.baseDir);
  }

  getName(): string {
    return 'leoric';
  }

  protected async createDataSource(
    config: any,
    dataSourceName: string
  ): Promise<Realm> {
    const { baseDir, sync, ...options } = config;
    let { models = [] } = config;
    if (models.length === 0) models = listModule('leoric:bone');
    if (models.length === 0) models = await loadModels(baseDir);
    const realm = new Realm({ ...options, models });
    await realm.connect();
    this.coreLogger.info('[midway:leoric] connecting and start');
    if (sync) await realm.sync();
    return realm;
  }

  protected async checkConnected(dataSource: Realm): Promise<boolean> {
    try {
      await dataSource.connect();
      return true;
    } catch (err) {
      this.coreLogger.error(err);
      return false;
    }
  }

  protected async destroyDataSource(dataSource: Realm) {
    if (await this.checkConnected(dataSource)) {
      await dataSource.disconnect();
    }
  }
}
