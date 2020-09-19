export function isAsyncFunction(fn) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}
