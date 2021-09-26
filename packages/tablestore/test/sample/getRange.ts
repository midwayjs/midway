import { createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { TableStoreService, Direction, INF_MAX, INF_MIN } from '../../src';

(async () => {

  let app = await createLightApp(join(__dirname, './fixtures/base-app'));
  const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);

  await tableStoreService.getRange({
    tableName: "sampleTable",
    direction: Direction.FORWARD,
    maxVersions: 10,
    inclusiveStartPrimaryKey: [{ "gid": INF_MIN }, { "uid": INF_MIN }],
    exclusiveEndPrimaryKey: [{ "gid": INF_MAX }, { "uid": INF_MAX }],
    limit: 2
  });

})();
