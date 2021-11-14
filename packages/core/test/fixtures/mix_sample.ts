import {Inject, Provide, Scope, ScopeEnum, Init} from '@midwayjs/decorator';

interface Engine {
  capacity;
}

@Scope(ScopeEnum.Prototype)
@Provide('petrol')
export class PetrolEngine implements Engine {
  capacity = 10;
}

@Scope(ScopeEnum.Prototype)
@Provide('diesel')
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

@Provide()
export class DieselCar implements CarFactory {
  dieselEngine: Engine;
  backUpDieselEngine: Engine;

  @Inject('engineFactory')
  factory: (category: string) => Engine;

  @Init()
  init() {
    this.dieselEngine = this.factory('diesel') as Engine;
    this.backUpDieselEngine = this.factory('diesel') as Engine;
  }

  run() {
    this.dieselEngine.capacity -= 5;
  }

}
