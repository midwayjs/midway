import {async, destroy, init, inject} from '../../src';

export interface Engine {
  start(fuel: Fuel);
}

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

export class Gas implements Fuel {

  capacity = 0;

  burn() {
    this.capacity -= 5;
  }

  add(capacity) {
    this.capacity += capacity;
  }
}

export class Electricity implements Fuel {

  capacity = 60;

  burn() {
    this.capacity -= 10;
  }

  add(capacity) {
    this.capacity += capacity;
  }
}

export class Car {

  private engine: Engine;
  private fuel: Fuel;

  public constructor(
    @inject('engine') engine: Engine,
    @inject() fuel: Fuel
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

}

export class Tesla extends Car {

  private engine: Engine;
  private fuel: Fuel;
  private computer;

  public constructor(
    @inject('engine') engine: Engine,
    computer,
    @inject() fuel: Fuel
  ) {
    super(engine, fuel);
    this.computer = computer;
    this.fuel.add(40);
  }
}
