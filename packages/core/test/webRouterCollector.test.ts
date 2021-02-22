import { WebRouterCollector } from '../src';
import { join } from 'path';

describe('/test/webRouterCollector.test.ts', function () {
  it('should test generate router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getRouterTable();
    console.log(result)
  });

  it('should test generate flatten router', async () => {
    const collector = new WebRouterCollector(join(__dirname, './fixtures/base-app-controller'));
    const result = await collector.getFlattenRouterTable();
    console.log(result)
  });
});
