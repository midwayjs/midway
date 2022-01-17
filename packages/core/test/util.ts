import {
  BaseFramework,
  destroyGlobalApplicationContext,
  IMidwayApplication,
  IMidwayBootstrapOptions,
  IMidwayFramework,
  initializeGlobalApplicationContext,
  MidwayFrameworkType,
  safeRequire,
  MidwayContainer,
} from '../src';
import { join } from 'path';
import { Configuration, CONFIGURATION_KEY, Framework, Inject } from '@midwayjs/decorator';

/**
 * 任意一个数组中的对象，和预期的对象属性一致即可
 * @param arr
 * @param matchObject
 * @param ignoreProperties
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

export async function createLightFramework(baseDir: string = '', globalConfig: any = {}): Promise<IMidwayFramework<any, any, any>> {
  /**
   * 一个全量的空框架
   */
  @Framework()
  class EmptyFramework extends BaseFramework<any, any, any> {
    private isStopped = false;
    getFrameworkType(): MidwayFrameworkType {
      return MidwayFrameworkType.EMPTY;
    }

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
  }

  @Configuration()
  class EmptyConfiguration {

    @Inject()
    customFramework: EmptyFramework;

    async onServerReady() {
      await this.customFramework.run();
    }
  }

  const imports = [{
    Configuration: EmptyConfiguration,
    EmptyFramework
  }];
  if (baseDir) {
    imports.push(safeRequire(join(baseDir, 'configuration')));
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
    globalConfig,
  });

  return container.get(EmptyFramework);
}
