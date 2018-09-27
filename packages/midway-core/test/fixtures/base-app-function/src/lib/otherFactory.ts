import {providerWrapper} from '../../../../../src/decorators';
import {IApplicationContext} from 'injection';

class MyTestObj {
  _notfound = null;
  _name = null;

  constructor(name) {
    this._name = name;
  }

  say() {
    return `hello ${this._name}.`;
  }
}

export function otherFactory(context: IApplicationContext) {
  return async (adapterName: string) => {
    return new MyTestObj(adapterName);
  };
}

export function otherFactory1(context: IApplicationContext) {
  return async (adapterName: string) => {
    return new MyTestObj(adapterName);
  };
}


providerWrapper([
  {
    id: 'otherFactory',
    provider: otherFactory
  },
  {
    id: 'otherFactory1',
    provider: otherFactory1,
    isAutowire: true
  }
]);
