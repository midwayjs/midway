import {inject, provide, singleton} from '../../src/annotation';

interface Engine {
  capacity;
}

@singleton(false)
@provide('petrol')
export class PetrolEngine implements Engine {
  capacity = 10;
}

@singleton(false)
@provide('diesel')
export class DieselEngine implements Engine {
  capacity = 20;
}

export function engineFactory(context) {
  return (named: string) => {
    return context.get(named);
  };
}

interface CarFactory {

}

@provide()
export class DieselCar implements CarFactory {
  dieselEngine: Engine;
  backUpDieselEngine: Engine;

  constructor(
    @inject('engineFactory') factory: (category: string) => Engine
  ) {
    this.dieselEngine = <Engine>factory('diesel');
    this.backUpDieselEngine = <Engine>factory('diesel');
  }

  run() {
    this.dieselEngine.capacity -= 5;
  }

}
