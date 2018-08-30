import {inject, provide, scope} from '../../src/annotation';
import {ScopeEnum} from '../../src';

interface Engine {
  capacity;
}

@scope(ScopeEnum.Prototype)
@provide('petrol')
export class PetrolEngine implements Engine {
  capacity = 10;
}

@scope(ScopeEnum.Prototype)
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
