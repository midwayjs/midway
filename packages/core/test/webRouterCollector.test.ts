import { WebRouterCollector } from '../src';
import { join } from 'path';

describe('/test/webRouterCollector.test.ts', function () {
  it('should test generate router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getRouterTable();
    expect(result.size).toEqual(3);

    const list = await collector.getRoutePriorityList();
    expect(list.length).toEqual(3);
  });

  it('should test generate flatten router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getFlattenRouterTable();
    expect(result.length > 0).toBeTruthy();
  });

  it('should test with function router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-func-router'));
    const result = await collector.getFlattenRouterTable();
    expect(result.length === 2).toBeTruthy();
  });
});
