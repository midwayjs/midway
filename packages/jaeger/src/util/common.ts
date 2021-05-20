import { NetworkInterfaceInfo, networkInterfaces } from 'os';

import { TracerConfig } from '../lib/types';

/**
 * 获取网络信息，不包括回环地址信息
 */
export function retrieveExternalNetWorkInfo(): NetworkInterfaceInfo[] {
  return Object.entries(networkInterfaces()).reduce(
    (acc: NetworkInterfaceInfo[], curr) => {
      const [, nets] = curr;
      /* istanbul ignore if */
      if (!nets) {
        return acc;
      }
      nets.forEach(net => {
        // Skip over internal (i.e. 127.0.0.1) addresses
        if (!net.internal) {
          acc.push(net);
        }
      });
      return acc;
    },
    []
  );
}

export function pathMatched(path: string, rules: TracerConfig['whiteList']): boolean {
  const ret = rules.some(rule => {
    if (!rule) {
      return;
    } else if (typeof rule === 'string') {
      return rule === path;
    } else {
      return rule.test(path);
    }
  });
  return ret;
}
