let asyncStorage;
let asyncNotSupport = 'un';
let index = 0;

export const genId = () => {
  index++;
  if (index > 100000000) {
    index = 0;
  }
  return `${Date.now()}:${index}:${Math.ceil(Math.random() * 10000)}`;
}

export const getAsyncLocalStoreage = () => {
  if (asyncStorage) {
    return asyncStorage;
  }
  try {
    const ALSClass = require('async_hooks').AsyncLocalStorage;
    asyncStorage = new ALSClass();
  } catch (e) {
    asyncStorage = asyncNotSupport
  }
  return asyncStorage;
}
export const getAsyncInfo = () => {
  const asyncStorage = getAsyncLocalStoreage();
  if (asyncStorage === asyncNotSupport) {
    return {};
  }
  const info = asyncStorage.getStore();
  return info || {};
}

export const asyncRunWrapper = (codeDyeConfig, parentInfo, fun) => {
  const asyncStorage = getAsyncLocalStoreage();
  if (asyncStorage === asyncNotSupport) {
    return fun();
  }
  return asyncStorage.run({ 
    codeDyeConfig,
    codeDyeParent: parentInfo,
  }, () => {
    return fun();
  });
}