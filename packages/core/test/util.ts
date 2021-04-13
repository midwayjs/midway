export function matchObjectPropertyInArray(arr, matchObject): boolean {
  let matched = false;
  for (let item of arr) {
    let num = Object.keys(matchObject).length;
    for (const property in matchObject) {
      if (JSON.stringify(item[property]) === JSON.stringify(matchObject[property])) {
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
