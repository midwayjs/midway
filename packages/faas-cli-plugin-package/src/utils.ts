interface Ilayer {
  [extName: string]: {
    path: string;
  };
}

export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {}, oss: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach(layerName => {
      if (!layer[layerName] || !layer[layerName].path) {
        return;
      }
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}

function commonPrefixUtil(str1: string, str2: string): string {
  let result = '';
  const n1 = str1.length;
  const n2 = str2.length;

  for (let i = 0, j = 0; i <= n1 - 1 && j <= n2 - 1; i++, j++) {
      if (str1[i] !== str2[j]) {
          break;
      }
      result += str1[i];
  }
  return result;
}

export function commonPrefix(arr: string[]): string {
  let prefix: string = arr && arr[0] || '';
  const n = arr && arr.length || 0;
  for (let i = 1; i <= n - 1; i++) {
      prefix = commonPrefixUtil(prefix, arr[i].replace(/([^\/])$/, '$1/'));
  }
  if (!prefix || prefix === '/') {
    return prefix;
  }
  const result = prefix.replace(/\/[^\/]*$/ig, '') || '/';
  if (result && !/^\//.test(result)) {
    return '/' + result;
  }
  return result;
}
