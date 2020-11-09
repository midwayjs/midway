import { FCBaseTrigger } from './base';

/**
 * https://help.aliyun.com/document_detail/100092.html
 */
export class TableStoreTrigger extends FCBaseTrigger {
  handler;

  async toArgs(): Promise<any[]> {
    const event = {
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

    return [event, this.createContext()];
  }
}

export const tableStore = TableStoreTrigger;
