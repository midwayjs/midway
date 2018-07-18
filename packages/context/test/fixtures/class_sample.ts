import {async, destroy, init, inject, provide} from '../../src';

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
  @inject('katana1')
  katana1: Katana;
  @inject('katana2')
  katana2: Katana;
}

export class BaseService {
  foodNumber = 10;

  @init()
  async open() {
    this.foodNumber = 20;
  }
}

@async()
@provide('serviceAsync')
export class BaseServiceAsync {

  foodNumber = 10;

  @init()
  async open() {
    this.foodNumber = 20;
  }

  @destroy()
  async destroy() {
  }
}

@async()
@provide('serviceGenerator')
export class BaseServiceGenerator {

  foodNumber = 10;

  @init()
  *open() {
    this.foodNumber = 20;
  }

  @destroy()
  async destroy() {
  }
}

