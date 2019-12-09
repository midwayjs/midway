import { FunctionEvent, ServerlessBaseRuntime } from '@midwayjs/runtime-engine';

export class HTTPEvent implements FunctionEvent {

  async create(
    runtime: ServerlessBaseRuntime,
    handlerFactory: (
      triggerType: string,
      triggerMeta: any
    ) => (arg: any) => Promise<any>
  ) {
    return handlerFactory('HTTP', {});
  }

  transformInvokeArgs(context): any[] {
    return [context, {}];
  }
}
