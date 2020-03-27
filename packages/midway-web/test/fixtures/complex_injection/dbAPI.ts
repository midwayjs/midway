import { ScopeEnum, Provide, Scope, Inject } from '@midwayjs/decorator';

@Provide()
export class A {
  config = {
    c: 1,
  };
}

@Provide()
export class B {
  config = {
    c: 2,
  };
}

@Scope(ScopeEnum.Singleton)
@Provide('newKey')
export class DbAPI {
  private config;

  constructor(@Inject() a, hello, @Inject() b) {
    this.config = a.config.c + b.config.c;
  }

  output() {
    console.log(this.config);
  }
}
