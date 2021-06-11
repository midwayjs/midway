import { Connection, ConnectionOptions } from 'typeorm';
import { OrmConnectionHook, OrmHook } from '../../../../src';
import { Provide, Scope, ScopeEnum } from '@midwayjs/decorator';

@OrmHook()
@Provide('baseFnHook')
@Scope(ScopeEnum.Singleton)
export class BaseFnHook implements OrmConnectionHook {
  public bcreate = 0;
  public bclose = 0;
  public acreate = 0;
  public aclose = 0;

  async beforeCreate?(opts?: ConnectionOptions): Promise<ConnectionOptions> {
    this.bcreate = 1;
    return opts;
  }

  async afterCreate?(conn?: Connection, opts?: ConnectionOptions): Promise<Connection>{
    this.acreate = 1;
    return conn;
  }

  async beforeClose?(conn?: Connection, connectionName?: string): Promise<Connection>{
    this.bclose = 1;
    return conn;
  }

  async afterClose?(conn?: Connection): Promise<Connection>{
    this.aclose = 1;
    return conn;
  }
}
