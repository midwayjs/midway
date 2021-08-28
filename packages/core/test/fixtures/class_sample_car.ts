import { Inject, Provide } from '@midwayjs/decorator';

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

  private engine: Engine;
  protected fuel: Fuel;

  constructor(
    @Inject('engine') engine: Engine,
    @Inject() fuel: Fuel
  ) {
    this.engine = engine;
    this.fuel = fuel;
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
    @Inject('engine') engine: Engine,
    computer,
    @Inject() fuel: Fuel
  ) {
    super(engine, fuel);
    this.computer = computer;
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
  getBrand() {
    return 'bmw';
  }
}
