import { MidwayInitializerPerformanceManager, MidwayPerformanceManager } from "../../src/common/performanceManager";
import { sleep } from "../../src";

describe('test/common/performanceManager.test.ts', () => {
  it('should mark start and end, and measure performance', async () => {
    const res = [];
    MidwayPerformanceManager.getInstance(MidwayPerformanceManager.DEFAULT_GROUP.INITIALIZE).observeMeasure((list) => {
      const entries = list.getEntries();
      res.push(...entries);
      console.log(entries)
    });

    MidwayInitializerPerformanceManager.markStart(MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE)
    await sleep(100);
    MidwayInitializerPerformanceManager.markStart(MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    await sleep(100);
    MidwayInitializerPerformanceManager.markEnd(MidwayInitializerPerformanceManager.MEASURE_KEYS.CONFIG_LOAD);
    await sleep(100);
    MidwayInitializerPerformanceManager.markStart(MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE);
    MidwayInitializerPerformanceManager.frameworkInitializeStart('http');
    await sleep(100);
    MidwayInitializerPerformanceManager.frameworkInitializeEnd('http');
    await sleep(100);
    MidwayInitializerPerformanceManager.markEnd(MidwayInitializerPerformanceManager.MEASURE_KEYS.FRAMEWORK_PREPARE);
    await sleep(100);
    MidwayInitializerPerformanceManager.markStart(MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE);
    await sleep(100);
    MidwayInitializerPerformanceManager.lifecycleStart('http', 'ready');
    await sleep(100);
    MidwayInitializerPerformanceManager.lifecycleEnd('http', 'ready');
    await sleep(100);
    MidwayInitializerPerformanceManager.lifecycleStart('grpc', 'ready');
    await sleep(100);
    MidwayInitializerPerformanceManager.lifecycleEnd('grpc', 'ready');
    await sleep(100);
    MidwayInitializerPerformanceManager.markEnd(MidwayInitializerPerformanceManager.MEASURE_KEYS.LIFECYCLE_PREPARE);
    MidwayInitializerPerformanceManager.markEnd(MidwayInitializerPerformanceManager.MEASURE_KEYS.INITIALIZE);

    await sleep(100);
    expect(res.length).toBe(7);
  });
});
