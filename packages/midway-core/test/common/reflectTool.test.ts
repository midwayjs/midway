import { recursiveGetPrototypeOf } from '../../src/common/reflectTool';
import { expect } from 'chai';
import { Grandson, Child, Parent } from '../fixtures/class_sample';

describe('/test/common/reflectTools.test.ts', () => {
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
