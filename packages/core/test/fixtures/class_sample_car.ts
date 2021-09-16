import { Inject, Provide, Init } from '@midwayjs/decorator';

export interface Engine {
  start(fuel: Fuel);
}
@Provide()
export class Turbo implements Engine {
  start(fuel: Fuel) {
    fuel.burn();
  }
}

export interface Fuel {
  capacity: number;
  burn();
  add(capacity: number);
}

@Provide()
export class Gas implements Fuel {

  capacity = 0;

  burn() {
    this.capacity -= 5;
  }

  add(capacity) {
    this.capacity += capacity;
  }
}

@Provide()
export class Electricity implements Fuel {

  capacity = 60;

  burn() {
    this.capacity -= 10;
  }

  add(capacity) {
    this.capacity += capacity;
  }
}

@Provide()
export class Car {
  @Inject('engine')
  private engine: Engine;
  @Inject()
  protected fuel: Fuel;

  @Init()
  init() {
    this.fuel.add(40);
  }

  public run() {
    return this.engine.start(this.fuel);
  }

  getFuelCapacity() {
    return this.fuel.capacity;
  }

  getBrand() {
  }
}

@Provide()
export class Tesla extends Car {
  private computer;

  constructor(
    computer,
  ) {
    super();
    this.computer = computer;
  }

  @Init()
  init() {
    super.init();
    this.fuel.add(40);
  }

  getComputer() {
    return this.computer;
  }

  getBrand() {
    return 'tesla';
  }
}

@Provide()
export class BMWX1 extends Car {

  // TODO 继承 @Init 装饰器
  // @Init()
  // init() {
  //   this.fuel.add(40);
  // }

  getBrand() {
    return 'bmw';
  }
}
