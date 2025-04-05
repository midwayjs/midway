import { extname, isAbsolute, resolve } from 'path';
import { readFileSync } from 'fs';

export function isPath(p): boolean {
  // eslint-disable-next-line no-useless-escape
  if (/(^[\.\/])|:|\\/.test(p)) {
    return true;
  }
  return false;
}

export function isPathEqual(one: string, two: string) {
  if (!one || !two) {
    return false;
  }
  const ext = extname(one);
  return one.replace(ext, '') === two;
}

export function getFileContentSync(filePath: any, encoding?: BufferEncoding) {
  return typeof filePath === 'string'
    ? readFileSync(filePath, {
        encoding,
      })
    : filePath;
}

/**
 * Normalize path, if p is absolute path, return p, otherwise join p with baseDir
 *
 * @example
 * ```ts
 * normalizePath('/a/b', 'c') => '/a/b/c'
 * normalizePath('/a/b', '/c') => '/c'
 * ```
 *
 * @param baseDir
 * @param p
 */
export function normalizePath(baseDir, p) {
  if (isAbsolute(p)) {
    return p;
  } else {
    return resolve(baseDir, p);
  }
}

export function getModuleRequirePathList(moduleName: string): string[] {
  const moduleNameList = [moduleName, moduleName.replace(/\//g, '_')];
  let moduleNameMap = {};
  const modulePathList = [];
  Object.keys(require.cache || {}).forEach(moduleName => {
    let moduleIndex = -1;
    for (const moduleName of moduleNameList) {
      const index = moduleName.indexOf(moduleName);
      if (index !== -1) {
        moduleIndex = index;
        break;
      }
    }
    if (moduleIndex === -1) {
      return;
    }
    const modulePath = moduleName.slice(0, moduleIndex);
    if (moduleNameMap[modulePath]) {
      return;
    }
    moduleNameMap[modulePath] = true;
    modulePathList.push(modulePath);
  });
  moduleNameMap = undefined;
  return modulePathList;
}

export const PathFileUtils = {
  isPath,
  isPathEqual,
  getFileContentSync,
};
