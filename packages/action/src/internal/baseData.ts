import { ActionConfiguration } from "../configuration";
import { DataTableName } from "./constants";

export class ActionDataProviderBase {
  config: ActionConfiguration;
  constructor(config: ActionConfiguration) {
    this.config = config;
  }
  async init() {}
  async insert(tableName: DataTableName, value: any): Promise<any> {
    return false;
  }

  async select(tableName: DataTableName, where: any): Promise<any> {
    return false;
  }

  async update(tableName: DataTableName, value: any): Promise<any> {
    return false;
  }
}