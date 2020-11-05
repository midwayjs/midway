export interface Trigger {
  useCallback: boolean;
  toArgs(): any;
  delegate(invokeWrapper: (invokeArgs: any[]) => any): any;
  close();
  createCallback(cb);
}

export class BaseTrigger implements Trigger {
  triggerOptions: any;
  useCallback = false;

  constructor(triggerOptions?: any) {
    this.triggerOptions = triggerOptions || {};
  }

  async toArgs(): Promise<any[]> {
    return Promise.resolve([]);
  }

  async close() {}

  createCallback(handler) {
    return (err, result) => {
      handler(err, result);
    };
  }

  async delegate(invokeWrapper: (invokeArgs: any[]) => any): Promise<any> {}
}
