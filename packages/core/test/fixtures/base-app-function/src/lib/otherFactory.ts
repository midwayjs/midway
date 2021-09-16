import { providerWrapper, IMidwayContainer } from '../../../../../src/';

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

class MyTestAuto {
  baiduAdapter = null;
  _name = null;
  constructor(name) {
    this._name = name;
  }

  say() {
    if (this.baiduAdapter == null) {
      throw new Error('baiduAdapter is null');
    }
    return `hello ${this._name}.`;
  }
}

export function otherFactory(context: IMidwayContainer) {
  return async (adapterName: string) => {
    return new MyTestObj(adapterName);
  };
}

export function otherFactory1(context: IMidwayContainer) {
  return new MyTestObj('adapterName');
}

export function otherFactory2(context: IMidwayContainer) {
  return async (adapterName: string) => {
    return new MyTestAuto(adapterName);
  };
}

export function otherFactory3(context: IMidwayContainer) {
  return new MyTestAuto('test');
}

providerWrapper([
  {
    id: 'otherFactory',
    provider: otherFactory,
  },
  {
    id: 'otherFactory1',
    provider: otherFactory1,
  },
  {
    // 用于测试自动装配是否成功
    id: 'otherFactory2',
    provider: otherFactory2,
  },
  {
    // 用于测试自动装配是否成功
    id: 'otherFactory3',
    provider: otherFactory3,
  },
]);
