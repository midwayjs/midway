import { recursiveGetPrototypeOf } from '../../src/common/reflectTool';
import { expect } from 'chai';
import { Grandson, Child, Parent } from '../fixtures/class_sample';

function Base() {}

function Hello() {}

Object.setPrototypeOf(Hello.prototype, Base.prototype);

describe('/test/common/reflectTools.test.ts', () => {
  it('reflectTool recursiveGetPrototypeOf should be ok', () => {
    const grandsonPrototyp = recursiveGetPrototypeOf(Grandson);
    const childPrototyp = recursiveGetPrototypeOf(Child);
    const parentPrototyp = recursiveGetPrototypeOf(Parent);
    expect(grandsonPrototyp).deep.eq([
      Child,
      Parent,
      Object.getPrototypeOf(Function),
      Object.prototype
    ]);
    expect(parentPrototyp).deep.eq([Function.prototype, Object.prototype]);
    expect(grandsonPrototyp.slice(1)).deep.eq(childPrototyp);
  });

  it('reflectTool recursiveGetPrototypeOf no constructor should be ok', () => {
    const originConstructor = Base.prototype.constructor;
    Base.prototype.constructor = null;
    const h = recursiveGetPrototypeOf(Hello);
    expect(h).is.an('array');
    expect(h[0]).is.a('function');

    Base.prototype.constructor = Hello;
    const h2 = recursiveGetPrototypeOf(Hello);
    expect(h2).is.an('array');
    expect(h2[0]).is.a('function');

    Base.prototype.constructor = originConstructor;
    const h3 = recursiveGetPrototypeOf(Hello);
    expect(h3).is.an('array');
    expect(h3[0]).is.a('function');
    expect(h3[0].toString()).contains('Base()');
  });
});
