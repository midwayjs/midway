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
    return [context, {}];
  }
}
