import { URL } from 'url';
import * as pm from 'picomatch';
export const parseUrl = (url: string, prop?: string) => {
  try {
    const parsed = new URL(url);
    return prop ? parsed[prop] : parsed;
  } catch (err) {
    return null;
  }
};

export const isSafeDomain = (domain: string, whiteList: string[]) => {
  if (typeof domain !== 'string') {
    return false;
  }
  domain = domain.toLowerCase();
  const hostname = '.' + domain;

  return whiteList.some(rule => {
    // Check whether we've got '*' as a wild character symbol()
    if (rule.includes('*')) {
      return pm(rule)(domain);
    }
    if (domain === rule) {
      return true;
    }
    if (!/^\./.test(rule)) {
      rule = `.${rule}`;
    }
    return hostname.endsWith(rule);
  });
};
