import {
  BaseFramework,
  destroyGlobalApplicationContext,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework,
  initializeGlobalApplicationContext,
  safeRequire,
  MidwayContainer,
  Configuration,
  CONFIGURATION_KEY,
  Framework,
  Inject,
  sleep,
  IMidwayContainer,
  loadModule,
  DefaultConsoleLoggerFactory,
} from '../src';
import { join } from 'path';
import * as http from 'http';
import * as getRawBody from 'raw-body';

/**
 * 任意一个数组中的对象，和预期的对象属性一致即可
 * @param arr
 * @param matchObject
 * @param debug
 */
export function matchObjectPropertyInArray(arr, matchObject, debug = false): boolean {
  let matched = false;
  let idx = 0;
  for (let item of arr) {
    if (debug) {
      console.log('check idx = ' + idx++);
    }
    let num = Object.keys(matchObject).length;
    for (const property in matchObject) {
      // console.log('start match ' + property);
      // console.log('result data', JSON.stringify(item[property]));
      // console.log('result data', JSON.stringify(matchObject[property]));
      if (deepEqual(item[property], matchObject[property])) {
        num--;
      } else {
        if (debug) {
          console.log(`property ${property} not match, 预期=${matchObject[property]}, 实际=${item[property]}`);
        }
        break;
      }
    }
    if (num === 0) {
      return true;
    }
  }
  return matched;
}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
    ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

export async function createLightFramework(baseDir: string = '', bootstrapOptions: IMidwayBootstrapOptions = {}): Promise<IMidwayFramework<any, any, any>> {
  /**
   * 一个全量的空框架
   */
  @Framework()
  class EmptyFramework extends BaseFramework<any, any, any> {
    private isStopped = false;

    async run(): Promise<void> {
    }

    async applicationInitialize(options: IMidwayBootstrapOptions) {
      this.app = {} as IMidwayApplication;
      this.defineApplicationProperties();
    }

    async beforeStop() {
      if (!this.isStopped) {
        this.isStopped = true;
        await destroyGlobalApplicationContext(this.applicationContext);
      }
    }

    configure() {
      return {};
    }

    getFrameworkName(): string {
      return 'light';
    }
  }

  @Configuration({
    namespace: 'empty'
  })
  class EmptyConfiguration {

    @Inject()
    customFramework: EmptyFramework;

    async onServerReady() {
      await this.customFramework.run();
    }
  }

  const imports = [{
    EmptyFramework,
    Configuration: EmptyConfiguration,
  }];

  const pkgJSON = await loadModule(join(baseDir, 'package.json'), {
    safeLoad: true,
    enableCache: false,
  });

  const loadMode = pkgJSON?.type === 'module' ? 'esm' : 'commonjs';

  // set default entry file
  if (baseDir) {
    imports.unshift(
      await loadModule(join(baseDir, 'configuration.ts'), {
        loadMode,
        safeLoad: true,
      }),
    );
  }

  const container = new MidwayContainer();
  const bindModuleMap: WeakMap<any, boolean> = new WeakMap();
  // 这里设置是因为在 midway 单测中会不断的复用装饰器元信息，又不能清理缓存，所以在这里做一些过滤
  container.onBeforeBind(target => {
    bindModuleMap.set(target, true);
  });

  const originMethod = container.listModule;

  container.listModule = key => {
    const modules = originMethod.call(container, key);
    if (key === CONFIGURATION_KEY) {
      return modules;
    }

    return modules.filter((module: any) => {
      return bindModuleMap.has(module);
    });
  };

  await initializeGlobalApplicationContext({
    baseDir,
    imports,
    applicationContext: container,
    loggerFactory: new DefaultConsoleLoggerFactory(),
    moduleLoadType: loadMode,
    ...bootstrapOptions,
  });

  return container.getAsync(EmptyFramework as any);
}

export async function createFramework(baseDir: string = '', globalConfig: any = {}, loggerFactory?): Promise<IMidwayContainer> {
  const container = new MidwayContainer();
  const bindModuleMap: WeakMap<any, boolean> = new WeakMap();
  // 这里设置是因为在 midway 单测中会不断的复用装饰器元信息，又不能清理缓存，所以在这里做一些过滤
  container.onBeforeBind(target => {
    bindModuleMap.set(target, true);
  });

  const originMethod = container.listModule;

  container.listModule = key => {
    const modules = originMethod.call(container, key);
    if (key === CONFIGURATION_KEY) {
      return modules;
    }

    return modules.filter((module: any) => {
      return bindModuleMap.has(module);
    });
  };

  return initializeGlobalApplicationContext({
    baseDir,
    imports: [
      safeRequire(join(baseDir, 'configuration'))
    ],
    applicationContext: container,
    globalConfig,
    loggerFactory,
  });
}

export async function createHttpServer(options?: {
  timeout?: number;
}): Promise<{
  getPort(): number;
  close();
}> {
  options = options || {};
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, response) => {
      if (options.timeout) {
        await sleep(options.timeout);
      }
      response.statusCode = 200;
      let body;
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        body = await getRawBody(req, {
          encoding: true,
        });
        body = JSON.parse(body);
      } else if (req.method === 'DELETE') {
        response.statusCode = 204;
        response.end('No Content');
        return
      }
      if (/javascript/.test(req.headers['content-type'])) {
        response.setHeader('content-type', 'text/javascript');
        response.end(JSON.stringify({
          headers: req.headers,
          url: req.url,
          method: req.method,
          message: body ?? 'hello world',
        }));
      } else {
        response.setHeader('content-type', 'text/plain');
        response.end(JSON.stringify({
          headers: req.headers,
          url: req.url,
          method: req.method,
          message: body ??'hello world',
        }));
      }
    });

    server.listen(0, () => {
      resolve({
        getPort() {
          return server.address()['port'];
        },
        close() {
          server.close();
        }
      });
    })
  })
}
