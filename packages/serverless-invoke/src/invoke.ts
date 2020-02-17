import { InvokeCore } from './core';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';

/**
 * 1、社区平台，找到入口，执行入口 + 参数
 * 2、自定义运行时，执行运行时的 invoke 方法 + 参数
 */
export class Invoke extends InvokeCore {
  async getInvokeFunction() {
    let invoke;
    let runtime;
    let triggerMap;
    const provider = this.spec && this.spec.provider && this.spec.provider.name;
    if (provider) {
      let handler: any = '';
      if (provider === 'fc' || provider === 'aliyun') {
        handler = await this.loadHandler(require.resolve('@midwayjs/serverless-fc-starter'));
        triggerMap = FCTrigger;
      } else if (provider === 'scf' || provider === 'tencent') {
        handler = await this.loadHandler(require.resolve('@midwayjs/serverless-scf-starter'));
      }
      if (handler) {
        runtime = createRuntime({
          handler: this.wrapperHandler(handler)
        });
      }
    }

    if (runtime) {
      invoke = async (...args) => {
        const trigger = this.getTrigger(triggerMap, args);
        await runtime.start();
        const result = await runtime.invoke(...trigger);
        await runtime.close();
        return result;
      };
    }
    if (!invoke) {
      invoke = await this.getUserFaaSHandlerFunction();
    }
    return invoke;
  }

  getTrigger(triggerMap, args) {
    if (!triggerMap) {
      return args;
    }
    let triggerName = this.options.trigger;
    if (!triggerName) {
      const funcInfo = this.getFunctionInfo();
      if (funcInfo.events && funcInfo.events.length) {
        triggerName = Object.keys(funcInfo.events[0])[0];
      }
    }
    const EventClass = triggerMap[triggerName];
    if (EventClass) {
      return [new EventClass(...args)];
    }
    return args;
  }
}
