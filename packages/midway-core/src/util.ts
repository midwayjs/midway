import { resolve, sep, dirname } from 'path';

export const safeRequire = p => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }

  try {
    return require(p);
  } catch (err) {
    // tslint:disable-next-line: no-bitwise
    if (err.code === 'MODULE_NOT_FOUND' && ~err.message.indexOf(p)) {
      return undefined;
    } else {
      throw err;
    }
  }
};
