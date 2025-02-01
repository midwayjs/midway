import { DynamicMidwayContainer, MidwayEnvironmentService, Provide } from '../../src';
import { join } from 'path';
import * as fs from 'fs';
import { fork } from 'child_process';

describe('/test/context/dynamicContainer.test.ts', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(__dirname, 'temp_test_files');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it('should test create instance with id', async () => {
    const container = new DynamicMidwayContainer();
    container.bind(MidwayEnvironmentService);

    @Provide()
    class TestService {
      getValue() {
        return 'old value';
      }
    }

    container.bind(TestService);
    expect(await container.getAsync(TestService)).toBeInstanceOf(TestService);
  });

  // 创建 tsconfig 文件
  const createTsConfig = () => {
    const tsconfigPath = join(tempDir, 'tsconfig.json');
    fs.writeFileSync(tsconfigPath, JSON.stringify({
      compilerOptions: {
        target: "ES2018",
        module: "CommonJS",
        moduleResolution: "node",
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowJs: true,
        strict: false,
        noImplicitAny: false,
        esModuleInterop: true,
        skipLibCheck: true,
        baseUrl: ".",
      }
    }, null, 2));
    return tsconfigPath;
  };

  // 创建测试运行器文件
  const createTestRunner = (testContent: string) => {
    const runnerPath = join(tempDir, 'test-runner.ts');
    fs.writeFileSync(runnerPath, `
      import { DynamicMidwayContainer, MidwayEnvironmentService } from '../../../src';
      
      interface TestService {
        getValue(): string;
      }

      interface DependencyService {
        getData(): string;
      }

      interface MainService {
        getData(): string;
      }

      async function runTest() {
        try {
          ${testContent}
        } catch (err) {
          process.send?.({ error: err.message });
          process.exit(1);
        }
      }

      runTest().then(() => {
        process.exit(0);
      }).catch(err => {
        process.send?.({ error: err.message });
        process.exit(1);
      });
    `);
    return runnerPath;
  };

  const runInChildProcess = (testContent: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const tsconfigPath = createTsConfig();
      const runnerPath = createTestRunner(testContent);

      // 使用 ts-node 执行 TypeScript 文件
      const child = fork(runnerPath, [], {
        execArgv: [
          '-r',
          `ts-node/register/transpile-only`,
          '--require',
        ],
        env: {
          ...process.env,
          TS_NODE_PROJECT: tsconfigPath
        },
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      });

      let error = '';

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          error += data.toString();
        });
      }

      child.on('message', (msg: { error?: string }) => {
        if (msg.error) {
          reject(new Error(msg.error));
        }
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(error || 'Test failed'));
        }
      });
    });
  };

  it('should update definition when file changes', async () => {
    const testFilePath = join(tempDir, 'test.service.ts');

    // 创建初始文件
    fs.writeFileSync(testFilePath, `
      import { Provide } from '../../../src';
      @Provide()
      export class TestService {
        getValue() {
          return 'old value';
        }
      }
    `);

    const testContent = `
      const container = new DynamicMidwayContainer();
      container.bind(MidwayEnvironmentService);
      
      // 绑定初始类
      const oldModule = require('${testFilePath.replace(/\\/g, '\\\\')}');
      container.bind(oldModule.TestService, {
        srcPath: '${testFilePath.replace(/\\/g, '\\\\')}',
        createFrom: 'file',
      });
      
      const oldInstance = await container.getAsync<TestService>(oldModule.TestService);
      if(oldInstance.getValue() !== 'old value') {
        throw new Error('Old value not matched');
      }

      // 更新文件内容
      require('fs').writeFileSync('${testFilePath.replace(/\\/g, '\\\\')}', \`
        import { Provide } from '../../../src';
        @Provide()
        export class TestService {
          getValue() {
            return 'new value';
          }
        }
      \`);

      await container.updateDefinition('${testFilePath.replace(/\\/g, '\\\\')}', 'testService');
      
      const newInstance = await container.getAsync<TestService>(oldModule.TestService);
      if(newInstance.getValue() !== 'new value') {
        throw new Error('New value not matched');
      }
    `;

    await runInChildProcess(testContent);
  });

  it('should handle dependency injection after update', async () => {
    const dependencyPath = join(tempDir, 'dependency.service.ts');
    const mainServicePath = join(tempDir, 'main.service.ts');

    // 创建初始依赖文件
    fs.writeFileSync(dependencyPath, `
      import { Provide } from '../../../src';
      @Provide()
      export class DependencyService {
        getData() {
          process.stdout.write('DependencyService old value called\\n');
          return 'old dependency';
        }
      }
    `);

    // 创建主服务文件
    fs.writeFileSync(mainServicePath, `
      import { Provide, Inject } from '../../../src';
      @Provide()
      export class MainService {
        @Inject()
        dependencyService;

        getData() {
          process.stdout.write('MainService getData called\\n');
          const result = this.dependencyService.getData() + '_main';
          process.stdout.write('Result: ' + result + '\\n');
          return result;
        }
      }
    `);

    const testContent = `
      process.stdout.write('Test starting...\\n');
      const container = new DynamicMidwayContainer();
      container.bind(MidwayEnvironmentService);
      
      const depModule = require('${dependencyPath.replace(/\\/g, '\\\\')}');
      const mainModule = require('${mainServicePath.replace(/\\/g, '\\\\')}');
      
      process.stdout.write('Binding services...\\n');
      
      container.bind(depModule.DependencyService, {
        srcPath: '${dependencyPath.replace(/\\/g, '\\\\')}',
        createFrom: 'file',
      });
      container.bind(mainModule.MainService, {
        srcPath: '${mainServicePath.replace(/\\/g, '\\\\')}',
        createFrom: 'file',
      });

      process.stdout.write('Getting old instance...\\n');
      const oldInstance = await container.getAsync(mainModule.MainService);
      const oldValue = oldInstance.getData();
      process.stdout.write('Old value: ' + oldValue + '\\n');
      
      if(oldValue !== 'old dependency_main') {
        throw new Error('Old dependency value not matched: ' + oldValue);
      }

      process.stdout.write('Updating dependency service...\\n');
      // 更新依赖服务
      require('fs').writeFileSync('${dependencyPath.replace(/\\/g, '\\\\')}', \`
        import { Provide } from '../../../src';
        @Provide()
        export class DependencyService {
          getData() {
            process.stdout.write('DependencyService new value called\\\\n');
            return 'new dependency';
          }
        }
      \`);

      process.stdout.write('Calling updateDefinition...\\n');
      await container.updateDefinition('${dependencyPath.replace(/\\/g, '\\\\')}', depModule.DependencyService.name);
      
      process.stdout.write('Getting new instance...\\n');
      const newInstance = await container.getAsync(mainModule.MainService);
      const newValue = newInstance.getData();
      process.stdout.write('New value: ' + newValue + '\\n');
      
      if(newValue !== 'new dependency_main') {
        throw new Error('New dependency value not matched. Expected: new dependency_main, Got: ' + newValue);
      }
      process.stdout.write('Test completed successfully\\n');
    `;

    await runInChildProcess(testContent);
  });

  it('should handle errors when file has syntax errors', async () => {
    const invalidFilePath = join(tempDir, 'invalid.service.ts');

    fs.writeFileSync(invalidFilePath, `
      import { Provide } from '../../../src';
      @Provide()
      export class InvalidService {
        // 语法错误
        constructor( {
      }
    `);

    const testContent = `
      const container = new DynamicMidwayContainer();
      container.bind(MidwayEnvironmentService);
      
      try {
        await container.updateDefinition('${invalidFilePath.replace(/\\/g, '\\\\')}', 'invalidService');
        throw new Error('Should throw syntax error');
      } catch (err) {
        // 期望抛出语法错误
        if (!err.message.includes('SyntaxError')) {
          throw new Error('Expected syntax error but got: ' + err.message);
        }
      }
    `;

    await runInChildProcess(testContent);
  });
});
