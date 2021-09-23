import { join } from 'path';
import {
  TableStoreService,
} from '../src';
import { createLightApp, close } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {

  it('should create table client', async () => {
    let app = await createLightApp(join(__dirname, './fixtures/base-app'));
    const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);
    expect(tableStoreService.putRow).toBeDefined();
    await close(app);
  });
});
