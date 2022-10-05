import { createLightFramework, matchObjectPropertyInArray } from '../util';
import * as path from 'path';
import { MidwayServerlessFunctionService, ServerlessTriggerType } from '../../src';

describe('/test/service/slsFunction.test.ts', function () {

  it('should test dynamic add function', async () => {
    const midwayServerlessFunctionService = new MidwayServerlessFunctionService();
    midwayServerlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return 'hello world';
    }, {
      type: ServerlessTriggerType.HTTP,
      metadata: {
        method: 'get',
        path: '/api/hello'
      },
      functionName: 'hello',
      handlerName: 'index.hello',
    });

    midwayServerlessFunctionService.addServerlessFunction(async (ctx, event) => {
      return 'hello world';
    }, {
      type: ServerlessTriggerType.HSF,
      metadata: {
        name: 'customHSF'
      },
      functionName: 'hsf',
      handlerName: 'index.hsf',
    });

    const result = await midwayServerlessFunctionService.getFunctionList();
    expect(result).toMatchSnapshot();
    expect(typeof result[0].method).toEqual('function');
  });

  it('should test with function router', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/base-app-func-router/src'
    ));
    const midwayWebRouterService = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
    let result = await midwayWebRouterService.getFlattenRouterTable();
    result = result.map(item => {
      delete item.id;
      return item;
    });
    expect(result).toMatchSnapshot();
  });

  it('should test with serverless trigger', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/app-with-serverless-trigger/src'
    ));
    const collector = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
    const result = await collector.getFlattenRouterTable();
    expect(matchObjectPropertyInArray(result, {
      functionName: 'helloAliyunService-handleTimerEvent',
      functionTriggerName: 'timer',
      functionTriggerMetadata: {
        type: 'cron',
        value: '0 0 4 * * *',
        name: 'custom_timer',
      },
      functionMetadata: {
        functionName: 'helloAliyunService-handleTimerEvent'
      }
    })).toBeTruthy();
    expect(matchObjectPropertyInArray(result, {
      functionName: 'hello_bbb',
      functionMetadata: {
        functionName: 'hello_bbb',
        concurrency: 2,
      },
    })).toBeTruthy();
  });

  it('should test duplicate router', async () => {
    const framework = await createLightFramework(path.join(
      __dirname,
      '../fixtures/app-with-duplicate-router/src'
    ));
    const collector = await framework.getApplicationContext().getAsync(MidwayServerlessFunctionService);
    await expect(collector.getFunctionList()).rejects.toThrow('Duplicate router')
  });

});
