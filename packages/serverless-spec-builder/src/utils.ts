export interface Ilayer {
  [extName: string]: {
    path: string;
  };
}
export function formatLayers(...multiLayers: Ilayer[]) {
  const layerTypeList = { npm: {} };
  multiLayers.forEach((layer: Ilayer) => {
    Object.keys(layer || {}).forEach((layerName) => {
      const [type, path] = layer[layerName].path.split(':');
      if (!layerTypeList[type]) {
        return;
      }
      layerTypeList[type][layerName] = path;
    });
  });
  return layerTypeList;
}

export function getLayers(...layersList: any) {
  const layerTypeList = formatLayers(...layersList);
  const layerDeps = [];
  const layers = [];

  if (layerTypeList && layerTypeList.npm) {
    Object.keys(layerTypeList.npm).forEach((originName: string) => {
      const name = 'layer_' + originName;
      layerDeps.push({ name, path: layerTypeList.npm[originName] });
      layers.push(name);
    });
  }
  return {
    layerDeps,
    layers,
  };
}

export function uppercaseObjectKey(obj) {
  if (obj) {
    const json = JSON.stringify(obj);
    const result = json.replace(/"([^"])([^"]*)":/gim, (...value) => {
      return `"${value[1].toUpperCase()}${value[2]}":`;
    });
    return JSON.parse(result);
  }
}

export function removeObjectEmptyAttributes(obj) {
  function isObjectEmpty(el) {
    return el !== null && el !== undefined && el !== '';
  }

  function removeEmptyArray(arr) {
    const newArr = [];

    for (const ele of arr) {
      if (ele && typeof ele === 'object') {
        const el = removeObjectEmptyAttributes(ele);
        if (isObjectEmpty(el)) {
          newArr.push(el);
        }
      } else if (isObjectEmpty(ele)) {
        newArr.push(ele);
      }
    }
    if (newArr.length) {
      return newArr;
    }
  }

  function removeEmptyObject(obj) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          const arr = removeEmptyArray(obj[key]);
          if (arr) {
            newObj[key] = arr;
          }
        } else {
          const ele = removeEmptyObject(obj[key]); // recurse
          if (ele) {
            newObj[key] = ele;
          }
        }
      } else if (isObjectEmpty(obj[key])) {
        newObj[key] = obj[key]; // copy value
      }
    });
    if (Object.keys(newObj).length > 0) {
      return newObj;
    }
  }

  return removeEmptyObject(obj);
}

/**
 * USER_DEFINED_ENVIRONMENT_VARIABLE
 */
const USER_DEFINIED_ENV_KEY = 'UDEV_';

export function filterUserDefinedEnv() {
  const userDefinedEnv = {};
  for (let key in process.env || {}) {
    if (key.startsWith(USER_DEFINIED_ENV_KEY)) {
      userDefinedEnv[key.replace(USER_DEFINIED_ENV_KEY, '')] = process.env[key];
    }
  }
  return userDefinedEnv;
}
