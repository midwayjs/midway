import { expect } from 'chai';
import SimpleLock from '../src';

describe('simple lock', () => {
  it('sureOnce should be ok', async () => {
    const lock = new SimpleLock();

    let i = 0;

    const arr = [lock.sureOnce(async () => {
      console.log(Date.now(), 44440);
      i++;
    }), lock.sureOnce(async () => {
      console.log(Date.now(), 44442);
      i++;
    }), lock.sureOnce(async () => {
      console.log(Date.now(), 44443);
      i++;
    }), lock.sureOnce(async () => {
      console.log(Date.now(), 44441);
      i++;
    })];

    await Promise.all(arr);
    expect(i).eq(1);
  });

  it('acquire should be ok', async () => {
    const lock = new SimpleLock();
    let i = 0;
    const data = [];

    const arr = [
      lock.acquire('hello', async () => {
        data.push(11);
        return i++;
      }), lock.acquire('hello', async () => {
        data.push(2);
        return i++;
      }), lock.acquire('hello', async () => {
        data.push(3);
        return i++;
      })
    ];

    const rets = await Promise.all(arr);
    expect([0, 1, 2]).deep.eq(rets);
    expect(3).eq(i);
    expect([11, 2, 3]).deep.eq(data);
  });
});
