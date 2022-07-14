import { AsyncLocalStorageContextManager } from './asyncLocalStorageContextManager';
import { AsyncHooksContextManager } from './asyncHooksContextManager';

const semver =
  /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z-]+(?:\.[\da-z-]+)*))?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?)?)?$/i;

// 判断 semver 大于等于 v14.8.0
export function isSemverGreaterThanOrEqualTo(
  currentVersion: string,
  targetVersion: string
) {
  const v = semver.exec(currentVersion);
  const t = semver.exec(targetVersion);
  if (v && t) {
    if (v[1] === t[1] && v[2] === t[2] && v[3] === t[3] && v[4] === t[4]) {
      return true;
    }

    return (
      gteString(v[1], t[1]) ||
      (v[1] === t[1] && gteString(v[2], t[2])) ||
      (v[1] === t[1] && v[2] === t[2] && gteString(v[3], t[3])) ||
      (v[1] === t[1] && v[2] === t[2] && v[3] === t[3] && gteString(v[4], t[4]))
    );
  }
  return false;
}

function gteString(v1: string, v2: string): boolean {
  // compare string with parseInt
  const v1Int = parseInt(v1, 10);
  const v2Int = parseInt(v2, 10);
  return v1Int > v2Int;
}

export function createContextManager() {
  const ContextManager = isSemverGreaterThanOrEqualTo(process.version, '14.8.0')
    ? AsyncLocalStorageContextManager
    : AsyncHooksContextManager;
  return new ContextManager();
}
