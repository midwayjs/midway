import { inject, provide, scope, ScopeEnum } from 'injection';

@provide()
export class A {
  config = {
    c: 1,
  };
}

@provide()
export class B {
  config = {
    c: 2,
  };
}

@scope(ScopeEnum.Singleton)
@provide('newKey')
export class DbAPI {

  private config;

  constructor(
  @inject() a,
    hello,
    @inject() b,
  ) {
    this.config = a.config.c + b.config.c;
  }

  output() {
    console.log(this.config);
  }
}
