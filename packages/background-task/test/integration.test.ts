import { createApp, close } from '@midwayjs/mock';
import { join } from 'path';

describe('Integration Test - Base App', () => {
  it('should run both promise and thread tasks in app lifecycle', async () => {
    const app = await createApp(
      join(__dirname, 'fixtures', 'base-app'),
    );

    // 等待任务完成
    await new Promise(resolve => setTimeout(resolve, 500));

    // 验证 Promise 模式结果
    const promiseResult = app.getAttr('promiseResult');
    expect(promiseResult).toBe(11); // 10 + 1

    // 验证 Thread 模式结果
    const threadResult = app.getAttr('threadResult');
    expect(threadResult).toBe(40); // 20 * 2

    await close(app);
  });

});

