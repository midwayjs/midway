import {Provide, Scope, Init, Inject, ScopeEnum} from '@midwayjs/decorator';

@Scope(ScopeEnum.Singleton)
@Provide()
export class HelloSingleton {
  ts: number;
  end: number;

  @Init()
  async doinit(): Promise<void> {
    this.ts = Date.now();
    return new Promise<void>(resolve => {
      setTimeout(() => {
        this.end = Date.now();
        resolve();
      }, 500);
    });
  }
}

@Scope(ScopeEnum.Singleton)
@Provide()
export class HelloErrorSingleton {
  public ts: number;
  public end: number;
  @Inject()
  public helloErrorInitSingleton;

  @Init()
  async doinit(): Promise<true> {
    this.ts = Date.now();
    return new Promise(resolve => {
      this.end = Date.now();
      setTimeout(resolve, 600);
    });
  }
}

@Scope(ScopeEnum.Singleton)
@Provide()
export class HelloErrorInitSingleton {
  public ts: number;
  public end: number;
  @Inject()
  public helloErrorSingleton;

  @Init()
  async doinit(): Promise<void> {
    this.ts = Date.now();
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        this.end = Date.now();
        resolve();
      }, 800);
    });
  }
}
