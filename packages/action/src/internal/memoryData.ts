import { ActionDataProviderBase } from './baseData';
import { DataTableName } from './constants';

export class ActionDataProviderMemory extends ActionDataProviderBase {
  private data: any = {};

  async insert(tableName: DataTableName, value: any): Promise<any> {
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }
    const id = this.data[tableName].length;
    value.id = id;
    this.data[tableName].push(value);
    return value;
  }
}
