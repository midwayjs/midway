import { FCBaseTrigger } from './base';
import { extend } from '@midwayjs/core';
import { FC } from '@midwayjs/faas-typings';
/**
 * https://help.aliyun.com/document_detail/100092.html
 */
export class TableStoreTrigger extends FCBaseTrigger {
  getEvent() {
    return {
      Version: 'string',
      Records: [
        {
          Type: 'string',
          Info: {
            Timestamp: Date.now(),
          },
          PrimaryKey: [
            {
              ColumnName: 'string',
              Value: 'new event',
            },
          ],
          Columns: [
            {
              Type: 'string',
              ColumnName: 'string',
              Value: 'new event',
              Timestamp: Date.now(),
            },
          ],
        },
      ],
    };
  }
}

export const tableStore = TableStoreTrigger;
export const createTableStoreEvent = (data: any = {}): FC.TableStoreEvent => {
  return extend(true, new TableStoreTrigger().getEvent(), data);
};
