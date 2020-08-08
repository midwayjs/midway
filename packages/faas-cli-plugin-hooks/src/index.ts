import { BasePlugin } from '@midwayjs/fcli-command-core';
import { resolve } from 'path';
import {
  hintConfig,
  helper,
  getFunctionsMeta,
  clearRoutes,
} from '../../../../hooks/packages/next-hooks-compiler';

export class HooksPlugin extends BasePlugin {
  get root() {
    return this.core.config.servicePath;
  }

  get isSkipTsBuild() {
    return this.getStore('skipTsBuild', 'global');
  }

  // private get lambda() {
  //   return resolve(this.apis, 'lambda');
  // }

  private static init = false;
  // private static isCompiled = false;

  hooks = {
    'before:invoke:compile': async () => {
      this.beforeCompile();
    },
    'after:invoke:emit': async () => {
      await this.afterCompile();
    },
    'before:package:compile': async () => {
      this.beforeCompile();
    },
    'after:package:emit': async () => {
      await this.afterCompile();
    },
  };

  beforeCompile() {
    if (this.isSkipTsBuild || !this.core.service.functionsRule) {
      return;
    }

    if (!HooksPlugin.init) {
      this.ensureProjectConfig();
      HooksPlugin.init = true;
    }

    // console.time('hooks compile cost');
    helper.rules = this.core.service.functionsRule;
    helper.root = resolve(this.root, 'src');
    clearRoutes();

    this.setStore('mwccHintConfig', hintConfig, true);
  }

  async afterCompile() {
    if (this.isSkipTsBuild || !this.core.service.functionsRule) {
      return;
    }

    // debug('afterCompile')

    const functions = getFunctionsMeta();
    Object.keys(functions).forEach(funName => {
      const funInfo = functions[funName];
      if (funInfo.gatewayConfig) {
        funInfo.events = [
          {
            http: {
              method: funInfo.gatewayConfig.method,
              path: funInfo.gatewayConfig.url,
            },
          },
        ];
      }
    });

    // debug('faas decorator function: %O', this.core.service.functions)
    // debug('hooks function: %O', functions)

    this.core.service.functions = Object.assign(
      this.core.service.functions,
      functions
    );

    // if (!HooksPlugin.isCompiled && process.env.NODE_ENV !== 'production') {
    //   startWatcher({
    //     root: this.root,
    //     apis: this.apis,
    //   })
    //   HooksPlugin.isCompiled = true
    // }
  }

  private ensureProjectConfig() {
    // if (this.core.service.functions) {
    //   throw new Error(`
    //     Midway Hooks 模式下不支持手动配置 functions，请删除 functions 字段后重新启动工程
    //     如需手动配置路由信息，请参考文档：https://yuque.antfin-inc.com/fanyi.lzj/hooks/faq#sp3zI
    //   `)
    // }

    // if (!fse.existsSync(this.lambda)) {
    //   throw new Error(`
    //     lambda 文件夹不存在，函数信息生成失败。请新建 src/apis/lambda 文件夹
    //     参考文档：https://yuque.antfin-inc.com/fanyi.lzj/hooks/faq#1Crco
    //   `)
    // }
  }
}
