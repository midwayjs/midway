import { close, createLightApp } from '@midwayjs/mock';
import { Provide } from '@midwayjs/core';
import * as bg from '../src';
import { IBackgroundTask } from '../src';

describe('runInBackground (Promise Mode)', () => {
  describe('Function Mode', () => {
    it('should execute function in main thread', async () => {
      const app = await createLightApp({
        imports: [bg],
      });

      const framework = app.getFramework() as bg.Framework;

      const result = await framework.runInBackground(
        async (payload: { value: number }) => {
          return payload.value * 2;
        },
        { payload: { value: 10 } }
      );

      expect(result).toBe(20);

      await close(app);
    });

    it('should execute without options', async () => {
      const app = await createLightApp({
        imports: [bg],
      });

      const framework = app.getFramework() as bg.Framework;

      const result = await framework.runInBackground(async () => {
        return 42;
      });

      expect(result).toBe(42);

      await close(app);
    });

    it('should call onComplete callback', async () => {
      const app = await createLightApp({
        imports: [bg],
      });

      const framework = app.getFramework() as bg.Framework;
      let callbackResult: number | undefined;

      const result = await framework.runInBackground(
        async (payload: { value: number }) => {
          return payload.value + 5;
        },
        {
          payload: { value: 15 },
          onComplete: res => {
            callbackResult = res;
          },
        }
      );

      expect(result).toBe(20);
      expect(callbackResult).toBe(20);

      await close(app);
    });

    it('should call onError callback when task fails', async () => {
      const app = await createLightApp({
        imports: [bg],
      });

      const framework = app.getFramework() as bg.Framework;
      let errorCaught: Error | undefined;

      await expect(
        framework.runInBackground(
          async () => {
            throw new Error('Task failed intentionally');
          },
          {
            onError: err => {
              errorCaught = err;
            },
          }
        )
      ).rejects.toThrow('Task failed intentionally');

      expect(errorCaught).toBeDefined();
      expect(errorCaught?.message).toBe('Task failed intentionally');

      await close(app);
    });
  });

  describe('Class Mode', () => {
    it('should execute class task in main thread', async () => {
      @Provide()
      class ComputeTask implements IBackgroundTask<{ value: number }, number> {
        async execute(payload: { value: number }) {
          return payload.value * 3;
        }
      }

      const app = await createLightApp({
        imports: [bg],
        preloadModules: [ComputeTask],
      });

      const framework = app.getFramework() as bg.Framework;

      const result = await framework.runInBackground(ComputeTask, {
        payload: { value: 10 },
      });

      expect(result).toBe(30);

      await close(app);
    });

    it('should track task status', async () => {
      @Provide()
      class SlowTask implements IBackgroundTask {
        async execute() {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'done';
        }
      }

      const app = await createLightApp({
        imports: [bg],
        preloadModules: [SlowTask],
      });

      const framework = app.getFramework() as bg.Framework;

      const promise = framework.runInBackground(SlowTask, {
        taskName: 'slowTask',
      });

      // 任务正在运行
      let status = framework.getTaskStatus('slowTask');
      expect(status?.status).toBe('running');

      // 等待任务完成
      await promise;
      status = framework.getTaskStatus('slowTask');
      expect(status?.status).toBe('completed');

      await close(app);
    });
  });

  describe('Task Management', () => {
    it('should get all tasks', async () => {
      const app = await createLightApp({
        imports: [bg],
      });

      const framework = app.getFramework() as bg.Framework;

      await framework.runInBackground(async () => 1, { taskName: 'task1' });
      await framework.runInBackground(async () => 2, { taskName: 'task2' });

      const allTasks = framework.getAllTasks();

      expect(allTasks.size).toBe(2);
      expect(allTasks.has('task1')).toBe(true);
      expect(allTasks.has('task2')).toBe(true);

      await close(app);
    });
  });
});
