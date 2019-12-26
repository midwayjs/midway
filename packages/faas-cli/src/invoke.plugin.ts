import {  InvokeClass } from '@midwayjs/faas-local';
import { runtimeEventMap } from '@midwayjs/invoke';
export class Invoke extends InvokeClass {
  constructor(core, options) {
    super(core, options);
  }
  getEventOptions(runtime: string, trigger: string) {
    const runtimeMap = runtimeEventMap[runtime] || {};
    return {
      starter: runtimeMap.starter,
      eventPath: runtimeMap.eventPath,
      eventName: runtimeMap.eventName && runtimeMap.eventName[trigger]
    };
  }
}
