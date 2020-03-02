import {Async, Destroy, Init, Inject, Provide} from '@midwayjs/decorator';

export interface Warrior {
  katana1;
  katana2;
}

export class Katana {
}

export class Ninja implements Warrior {
  katana1;
  katana2;
}

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

export class BaseService {
  foodNumber = 10;

  @Init()
  async open() {
    this.foodNumber = 20;
  }
}

@Async()
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

@Async()
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

export class Child extends Parent {
  @Inject('katana2')
  katana2: Katana;
}

export class Grandson extends Child {
  @Inject('katana3')
  katana3: Katana;
}

export class SubChild {
  @Inject()
  subAny: any;
}
export class SubParent {
  @Inject()
  subChild: SubChild;
}
