import { WebRouterCollector, clearAllModule } from '../../src';
import { join } from 'path';

describe('/test/common/webRouterCollector.test.ts', function () {

  it('should test generate router', async () => {
    clearAllModule()
    const collector = new WebRouterCollector(join(__dirname, '../fixtures/base-app-controller'));
    const result = await collector.getRouterTable();
    expect(result.size).toEqual(3);

    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(3);

    const result1 = await collector.getFlattenRouterTable();
    expect(result1.length > 0).toBeTruthy();
  });
});
