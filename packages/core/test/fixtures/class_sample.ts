import {App, Config, Destroy, Init, Inject, Provide, Plugin} from '@midwayjs/decorator';

export interface Warrior {
  katana1;
  katana2;
}
@Provide()
export class Katana {
}
@Provide()
export class Ninja implements Warrior {
  katana1;
  katana2;
}
@Provide()
export class Samurai implements Warrior {
  args?: any;
  constructor(args?: any) {
    this.args = args;
  }

  @Inject('katana1')
  katana1: Katana;
  @Inject('katana2')
  katana2: Katana;
}
@Provide()
export class BaseService {
  foodNumber = 10;

  @Init()
  async open() {
    this.foodNumber = 20;
  }
}

@Provide('serviceAsync')
export class BaseServiceAsync {

  foodNumber = 10;

  @Init()
  async open() {
    this.foodNumber = 20;
  }

  @Destroy()
  async destroy() {
  }
}

@Provide('serviceGenerator')
export class BaseServiceGenerator {

  foodNumber = 10;

  @Init()
  *open() {
    this.foodNumber = 20;
  }

  @Destroy()
  async destroy() {
  }
}

export class Parent {
  @Inject('katana1')
  katana1: Katana;
}
@Provide()
export class Child extends Parent {
  @Inject('katana2')
  katana2: Katana;
}
@Provide()
export class Grandson extends Child {
  @Inject('katana3')
  katana3: Katana;
}
@Provide()
export class SubChild {
  @Inject()
  subAny: any;
}
@Provide()
export class SubParent {
  @Inject()
  subChild: SubChild;
}

export class ParentCustom {
  @Config('hello')
  hello: any;

  @App()
  a: any;

  @Plugin('hh')
  p: any;
}
@Provide('subCustom')
export class SubCustom extends ParentCustom {
  @Config('tt')
  tt: any;

  @App()
  a: any;

  @Plugin()
  bb: any;
}
