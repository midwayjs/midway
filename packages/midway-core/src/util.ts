import { dirname, resolve, sep } from 'path';

export const safeRequire = p => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }

  try {
    return require(p);
  } catch (err) {
    return undefined;
  }
};

export const isPath = (p): boolean => {
  if (/(^[\.\/])|:|\\/.test(p)) {
    return true;
  }
  return false;
};
