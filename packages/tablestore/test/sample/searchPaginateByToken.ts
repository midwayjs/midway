import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { ColumnReturnType, QueryType, SortOrder, TableStoreService } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.search({
    tableName: "nestedTag",
    indexName: "testIndex",
    searchQuery: {
      offset: 0,
      limit: 1,
      query: {
        queryType: QueryType.MATCH_ALL_QUERY
      },
      sort: {
        sorters: [
          {
            fieldSort: {
              fieldName: "pic_id",
              order: SortOrder.SORT_ORDER_DESC,
            }
          }
        ]
      },
      getTotalCount: true
    },
    columnToGet: {
      returnType: ColumnReturnType.RETURN_NONE,
      returnNames: ["pic_tag", "pic_description", "time_stamp", "pos"]
    }
  });

})();
