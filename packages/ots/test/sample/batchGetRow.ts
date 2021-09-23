import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { Long, TableStoreService } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.batchGetRow({
    tables: [{
      tableName: 'sampleTable',
      primaryKey: [
        [{'gid': Long.fromNumber(20013)}, {'uid': Long.fromNumber(20013)}],
        [{'gid': Long.fromNumber(20015)}, {'uid': Long.fromNumber(20015)}]
      ],
      startColumn: 'col2',
      endColumn: 'col4'
    },
      {
        tableName: 'notExistTable',
        primaryKey: [
          [{'gid': Long.fromNumber(10001)}, {'uid': Long.fromNumber(10001)}]
        ]
      }
    ],
  });

})();
