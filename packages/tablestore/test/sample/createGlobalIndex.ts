import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, IndexUpdateMode, IndexType } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.createIndex({
    mainTableName: "sdkGlobalTest",
    indexMeta: {
      name: "sdkIndex2",
      primaryKey: ["col1"],
      definedColumn: ["col2"],
      includeBaseData: false,
      indexUpdateMode: IndexUpdateMode.IUM_ASYNC_INDEX,//默认增量
      indexType: IndexType.IT_GLOBAL_INDEX,//IT_GLOBAL_INDEX
    }
  });

})();
