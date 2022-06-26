export interface Trigger {
  useCallback: boolean;
  toArgs(): any;
  getEvent(): any;
  delegate(invokeWrapper: (invokeArgs: any[]) => any): any;
  close();
  createCallback(cb);
  createContext();
}

export class BaseTrigger implements Trigger {
  useCallback = false;

  async toArgs(): Promise<any[]> {
    const event = this.getEvent();
    return Promise.resolve([event, this.createContext()]);
  }

  createCallback(handler) {
    return (err, result) => {
      handler(err, result);
    };
  }

  async delegate(invokeWrapper: (invokeArgs: any[]) => any): Promise<any> {}

  async close() {}

  getEvent() {}

  createContext() {}
}
