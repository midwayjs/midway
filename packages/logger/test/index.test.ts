import { createFrameworkLogger } from '../src/logger';
import { join } from 'path';
import { fileExists, includeContent, removeFileOrDir, sleep, createChildProcess } from './util';

describe('/test/index.test.ts', () => {
  it('should test create logger', async () => {
    const logsDir = join(__dirname, 'logs');
    await removeFileOrDir(logsDir);
    const coreLogger = createFrameworkLogger({
      dir: logsDir,
    });
    coreLogger.info('hello world1');
    coreLogger.info('hello world2');
    coreLogger.info('hello world3');
    coreLogger.info('hello world4');
    coreLogger.error('hello world5');

    await sleep();
    // test logger file exist
    expect(fileExists(join(logsDir, 'midway-core.log'))).toBeTruthy();
    expect(fileExists(join(logsDir, 'common-error.log'))).toBeTruthy();

    // test logger file include content
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world1')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world2')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world3')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world4')).toBeTruthy();
    expect(includeContent(join(logsDir, 'midway-core.log'), 'hello world5')).toBeTruthy();

    // test error logger  file include content
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world1')).toBeFalsy();
    expect(includeContent(join(logsDir, 'common-error.log'), 'hello world5')).toBeTruthy();
    await removeFileOrDir(logsDir);
  });

  it.only('should create logger in cluster mode', async ()  => {
    const clusterFile = join(__dirname, 'fixtures/cluster.ts');
    const child = createChildProcess(clusterFile);
    const pidList = await new Promise(resolve => {
      child.on('message', (pidList) => {
        resolve(pidList);
      });
    });
    console.log(pidList)
    await sleep(10000);
    child.kill();
  });
});
