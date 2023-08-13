import { Destroy, Init } from '../decorator';

export abstract class DataListener<T> {
  private innerData: T;

  @Init()
  protected async init() {
    this.innerData = await this.initData();
    await this.onData(this.setData.bind(this));
  }

  abstract initData(): T | Promise<T>;
  abstract onData(callback: (data: T) => void);

  protected setData(data: T): void {
    this.innerData = data;
  }

  public getData(): T {
    return this.innerData;
  }

  @Destroy()
  public async stop() {
    await this.destroyListener();
  }

  protected async destroyListener() {}
}
