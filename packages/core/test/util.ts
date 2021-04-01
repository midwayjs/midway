export function matchObjectPropertyInArray(arr, matchObject): boolean {
  let matched = false;
  for (let item of arr) {
    for (const property in matchObject) {
      if (item[property] && matchObject[property] && JSON.stringify(item[property]) === JSON.stringify(matchObject[property])) {
        return true;
      }
    }
  }
  return matched;
}
