import { Destroy, Init } from '../decorator';

export abstract class DataListener<T, U = T> {
  protected innerData: T;
  private isReady = false;

  @Init()
  protected async init() {
    if (!this.isReady) {
      this.innerData = await this.initData();
      await this.onData(this.setData.bind(this));
      this.isReady = true;
    }
  }

  abstract initData(): T | Promise<T>;
  abstract onData(callback: (data: T) => void);

  protected setData(data: T): void {
    this.innerData = data;
  }

  public getData(): U {
    return this.transformData(this.innerData);
  }

  protected transformData(data: T): U {
    return data as unknown as U;
  }

  @Destroy()
  public async stop() {
    await this.destroyListener();
  }

  protected async destroyListener() {}
}
