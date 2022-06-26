import { FunctionEvent } from '@midwayjs/runtime-engine';

export class HTTPEvent implements FunctionEvent {
  type;
  meta;

  constructor() {
    this.type = 'HTTP';
    this.meta = {};
  }

  match() {
    return true;
  }

  transformInvokeArgs(context): any[] {
    if (Array.isArray(context)) {
      context = context.shift();
    }
    return [context, {}];
  }
}
