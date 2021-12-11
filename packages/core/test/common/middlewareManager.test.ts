import { ContextMiddlewareManager } from '../../src';

const mw1 = async (ctx, next) => {};
mw1._name = 'mw1';

const mw2 = async (ctx, next) => {};
mw2._name = 'mw2';

const mw3 = class MW3 {resolve() {}} as any;
const mw4 = class MW4 {resolve() {}} as any;

function mw5(){}
function mw6(){}

describe('test/common/middlewareManager.test.ts', function () {
  it('should test manager like array insert first', function () {
    const manager = new ContextMiddlewareManager();
    // insert first
    manager.insertFirst(mw1);
    manager.insertFirst(mw2);
    manager.insertFirst([mw4, mw3]);

    expect(manager.length).toEqual(4);
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test manager like array insert last', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertLast([mw2, mw3]);
    manager.insertLast(mw4);
    manager.insertLast(mw5);
    manager.insertFirst(mw1);

    expect(manager.length).toEqual(5);
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test manager like array insert before', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst(mw1);
    manager.insertBefore([mw2, mw3], mw1);
    manager.insertBefore(mw5, 2);
    manager.insertBefore(mw6, 'MW3');

    expect(manager.length).toEqual(5);
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test manager like array insert after', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst(mw1);
    manager.insertAfter([mw2, mw3], mw1);
    manager.insertBefore(mw5, 2);
    manager.insertAfter(mw6, 'mw1');

    expect(manager.length).toEqual(5);
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test idx greater then the length of array', function () {
    const manager = new ContextMiddlewareManager();
    manager.insertAfter(mw1, 5);
    expect(manager.length).toEqual(1);

    manager.insertBefore(mw2, -1);
    manager.insertBefore(mw3, -2);
    expect(manager.length).toEqual(3);

    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test find middleware', function () {
    const manager = new ContextMiddlewareManager();
    manager.push(mw1);
    manager.push(mw2);
    manager.insertLast([mw4, mw3]);

    expect(manager.findItemIndex('MW4')).toEqual(2);
    expect(manager.findItemIndex(mw4)).toEqual(2);
    expect(manager.findItemIndex(2)).toEqual(2);
    expect(manager.findItemIndex(mw5)).toEqual(-1);

    expect(manager.findItem(mw3)).toEqual(mw3);
    expect(manager.findItem('MW3')).toEqual(mw3);
    expect(manager.findItem(-1)).toBeUndefined();
    expect(manager.findItem(10)).toBeUndefined();
  });

  it('should get name from middleware', function () {
    const manager = new ContextMiddlewareManager();

    expect(manager.getMiddlewareName(mw1)).toEqual('mw1');
    expect(manager.getMiddlewareName(mw3)).toEqual('MW3');
    expect(manager.getMiddlewareName(mw5)).toEqual('mw5');
  });

  it('should remove middleware', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst(mw1);
    manager.insertFirst(mw2);
    manager.insertFirst([mw4, mw3]);

    manager.remove(mw1);
    expect(manager.length).toEqual(3);
    expect(manager.getNames()).toMatchSnapshot();

    manager.remove('MW3');
    expect(manager.length).toEqual(2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.remove(1);
    expect(manager.length).toEqual(1);
    expect(manager.getNames()).toMatchSnapshot();

    manager.remove(5);
    expect(manager.length).toEqual(1);
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test find and insert after', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst([mw1, mw2, mw3, mw4, mw5, mw6]);

    manager.findAndInsertAfter(mw3, mw5);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter(mw3, 'mw2');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter('mw2', 'MW4');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter('MW4', 4);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter(mw3, 'mw7');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter('mw8', mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter(mw2, mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter('mw2', mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertAfter(mw2, 'mw2');
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test find and insert before', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst([mw1, mw2, mw3, mw4, mw5, mw6]);

    manager.findAndInsertBefore(mw3, mw5);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore(mw3, 'mw2');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore('mw6', 'MW4');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore('MW4', 1);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore(mw3, 'mw7');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore('mw8', mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore(mw2, mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore('mw2', mw2);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertBefore(mw2, 'mw2');
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test find and insert first', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst([mw1, mw2, mw3, mw4, mw5, mw6]);

    manager.findAndInsertFirst(mw5);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertFirst('mw2');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertFirst('mw7');
    expect(manager.getNames()).toMatchSnapshot();
  });

  it('should test find and insert last', function () {
    const manager = new ContextMiddlewareManager();

    manager.insertFirst([mw1, mw2, mw3, mw4, mw5, mw6]);

    manager.findAndInsertLast(mw5);
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertLast('mw2');
    expect(manager.getNames()).toMatchSnapshot();

    manager.findAndInsertLast('mw7');
    expect(manager.getNames()).toMatchSnapshot();
  });
});
