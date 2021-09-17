/**
 * 任意一个数组中的对象，和预期的对象属性一致即可
 * @param arr
 * @param matchObject
 * @param ignoreProperties
 */
export function matchObjectPropertyInArray(arr, matchObject, debug = false): boolean {
  let matched = false;
  let idx = 0;
  for (let item of arr) {
    if (debug) {
      console.log('check idx = ' + idx++);
    }
    let num = Object.keys(matchObject).length;
    for (const property in matchObject) {
      // console.log('start match ' + property);
      // console.log('result data', JSON.stringify(item[property]));
      // console.log('result data', JSON.stringify(matchObject[property]));
      if (deepEqual(item[property], matchObject[property])) {
        num--;
      } else {
        if (debug) {
          console.log(`property ${property} not match, 预期=${matchObject[property]}, 实际=${item[property]}`);
        }
        break;
      }
    }
    if (num === 0) {
      return true;
    }
  }
  return matched;
}

function deepEqual(x, y) {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
    ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}
