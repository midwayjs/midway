import assert from 'assert';
import SimpleLock from '../src';

describe('simple lock', () => {
  it('sureOnce should be ok', async () => {
    const lock = new SimpleLock();

    let i = 0;

    const arr = [
      lock.sureOnce(async () => {
        console.log(Date.now(), 44440);
        i++;
      }),
      lock.sureOnce(async () => {
        console.log(Date.now(), 44442);
        i++;
      }),
      lock.sureOnce(async () => {
        console.log(Date.now(), 44443);
        i++;
      }),
      lock.sureOnce(async () => {
        console.log(Date.now(), 44441);
        i++;
      }),
    ];

    await Promise.all(arr);
    assert(i === 1);
  });

  it('acquire should be ok', async () => {
    const lock = new SimpleLock();
    let i = 0;
    const data = [];

    const arr = [
      lock.acquire('hello', async () => {
        data.push(11);
        return i++;
      }),
      lock.acquire('hello', async () => {
        data.push(2);
        return i++;
      }),
      lock.acquire('hello', async () => {
        data.push(3);
        return i++;
      }),
    ];

    const rets = await Promise.all(arr);
    assert.deepEqual([0, 1, 2], rets);
    assert(3 === i);
    assert.deepEqual([11, 2, 3], data);
  });
});
