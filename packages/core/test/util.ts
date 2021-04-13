export function matchObjectPropertyInArray(arr, matchObject): boolean {
  let matched = false;
  for (let item of arr) {
    let num = Object.keys(matchObject).length;
    for (const property in matchObject) {
      if (deepEqual(item[property], matchObject[property])) {
        num--;
      } else {
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
