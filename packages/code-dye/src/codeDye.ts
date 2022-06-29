import { getAsyncInfo, asyncRunWrapper, genId } from './reqInfo';
const copyObject = (obj, paths) => {
  const properties = Object.getOwnPropertyNames(obj);
  properties.forEach(property => {
    if (property === 'constructor') {
      return;
    }
    const propertyInfo = Object.getOwnPropertyDescriptor(obj, property);
    if (!propertyInfo.configurable) {
      // skip un configurable
      return;
    }
   
    let isCanDefine = false;

    if (propertyInfo.get) {
      propertyInfo.get = codeDye(
        propertyInfo.get,
        paths.concat('[prototype get] ' + property),
      );
      isCanDefine = true;
    }
    if (propertyInfo.set) {
      propertyInfo.set = codeDye(
        propertyInfo.set,
        paths.concat('[prototype set] ' + property),
      );
      isCanDefine = true;
    }

    if (propertyInfo.value) {
      propertyInfo.value = codeDye(propertyInfo.value, paths);
      isCanDefine = true;
    }

    if (isCanDefine) {
      Object.defineProperty(obj, property, propertyInfo);
    }
  });
}

const codeDyeAFuncWrapper = function (func, paths) {
  return async function (...args) {
    const info = getAsyncInfo();
    const newInfo: any = {
      codeDyeParent: info.codeDyeParent
    };
    newInfo.call = [];
    const id = genId();
    newInfo.id = id;
    newInfo.paths = paths;
    newInfo.start = {
      time: Date.now(),
      args: args
    }
    if (info.codeDyeParent && info.codeDyeParent.call) {
      info.codeDyeParent.call.push(newInfo);
    }
    // // @ts-ignore
    const _this = this;
    const res = await asyncRunWrapper(info.codeDyeConfig, newInfo, async () => {
      return func.call(_this, ...args);
    });
    newInfo.end = {
      time: Date.now(),
      result: res
    }
    return res;
  };
}

const codeDyeFuncWrapper = function (func, paths) {
  return function (...args) {
    const info = getAsyncInfo();
    
    const newInfo: any = {
      codeDyeParent: info.codeDyeParent
    };
    newInfo.call = [];
    const  id = genId();
    newInfo.id = id;
    newInfo.paths = paths;
    newInfo.start = {
      time: Date.now(),
      args: args
    }
    if (info.codeDyeParent && info.codeDyeParent.call) {
      info.codeDyeParent.call.push(newInfo);
    }
    // // @ts-ignore
    const _this = this;
    const res = asyncRunWrapper(info.codeDyeConfig, newInfo, () => {
      return func.call(_this, ...args);
    });
    newInfo.end = {
      time: Date.now(),
      result: res
    }
    return res;
  };
}

export const codeDye = (variable, paths) => {

  if (!paths) {
    paths = []
  }
  if (paths[0] ===__filename) {
    return variable;
  }

  const type = ({}).toString.call(variable).slice(8, -1).toLowerCase();
  switch(type) {
    case 'object': 
      copyObject(variable, paths);
      return variable;
    case 'array':
      return variable.map((variable, index) => {
        return codeDye(variable, paths.concat('[index]' + index));
      });
    case 'function':
      const str = variable.toString();
      if (str.startsWith('class ')) {
        // class
        copyObject(variable.prototype, paths.concat(`[class] ${variable.name}`));
        return variable;
      }
      return codeDyeFuncWrapper(variable, paths.concat('[func] ' + variable.name));
    case 'asyncfunction':
      return codeDyeAFuncWrapper(variable, paths.concat('[async func] '  + variable.name));
  }
  return variable;
}
