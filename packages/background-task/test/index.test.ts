import { createLegacyApp, close, createLightApp } from '@midwayjs/mock';
import { join } from 'path';
import * as bg from '../src';
import { BackgroundTask, IBackgroundTask } from '../src';

describe('/test/index.test.ts', () => {
  it('run background task with decorator', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {
      imports: [bg],
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    const res = app.getAttr('bg_task');
    expect(res).toEqual(1);
    await close(app);
  });

  it('should get task by class and name', async () => {
    @BackgroundTask('bgTest')
    class BgTest implements IBackgroundTask {
      async execute() {}
    }
    const app = await createLightApp({
      imports: [bg],
      preloadModules: [BgTest],
    });
    const framework = app.getFramework() as bg.Framework;
    expect(framework.getTask(BgTest)).toBeTruthy();
    expect(framework.getTask('bgTest')).toBeTruthy();
    await close(app);
  });

  it('should create dynamic background task via API', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures', 'base-app'), {
      imports: [bg],
    });
    const framework = app.getFramework() as bg.Framework;
    await framework.createTask('dynTask', async (ctx) => {
      // @ts-ignore
      ctx.app.setAttr('bg_task_dynamic', 1);
      return 1;
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    const res = app.getAttr('bg_task_dynamic');
    expect(res).toEqual(1);
    await close(app);
  });
});
