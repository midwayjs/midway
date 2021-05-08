const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowers = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const specials = '_-|@.,?/!~#$%^&*(){}[]+=';
const charClasses = [uppers, lowers, numbers, specials];
const minLen = charClasses.length;
function chooseRandom(x) {
  const i = Math.floor(Math.random() * x.length);
  return (typeof (x) === 'string') ? x.substr(i, 1) : x[i];
}

export const randomString = (maxLen) => {
  maxLen = (maxLen || 36);
  if (maxLen < minLen) {
    throw new Error('length must be >= ' + minLen);
  }

  let str = '';
  const usedClasses = {};
  let charClass;
  do { // Append a random char from a random char class.
    while (str.length < maxLen) {
      charClass = chooseRandom(charClasses);
      usedClasses[charClass] = true;
      str += chooseRandom(charClass);
    }
    // Ensure we have picked from every char class.
  } while (Object.keys(usedClasses).length !== charClasses.length);

  return str;
}
