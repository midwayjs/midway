import { join } from 'path';
import {
  ComparatorType,
  CompositeCondition,
  Condition,
  LogicalOperator,
  RowExistenceExpectation,
  SingleColumnCondition,
  TableStoreService,
  TableStoreServiceFactory,
} from '../src';
import { createLightApp, close } from '@midwayjs/mock';

describe('/test/index.test.ts', () => {

  it('should create table client', async () => {
    let app = await createLightApp(join(__dirname, './fixtures/base-app'));
    const tableStoreService = await app.getApplicationContext().getAsync(TableStoreService);
    expect(tableStoreService.putRow).toBeDefined();

    const tableStoreServiceFactory = await app.getApplicationContext().getAsync(TableStoreServiceFactory);
    expect(tableStoreServiceFactory).toBeDefined();
    expect(tableStoreServiceFactory.getName()).toEqual('tableStore');
    await close(app);
  });

  it('should test proxy', function () {
    const condition = new CompositeCondition(LogicalOperator.AND);
    condition.addSubCondition(new SingleColumnCondition('name', 'john', ComparatorType.EQUAL));
    condition.addSubCondition(new SingleColumnCondition('addr', 'china', ComparatorType.EQUAL));
    expect(condition).toBeDefined();

    const condition1 = new Condition(RowExistenceExpectation.IGNORE, null);
    expect(condition1).toBeDefined();
  });
});
