const {
  saveModule,
  saveProviderId,
  FUNC_KEY,
  attachClassMetadata,
  savePropertyInject,
} = require('@midwayjs/decorator');
const { join } = require('path');
const { existsSync } = require('fs');

const registerFunctionToIoc = (container, functionName, func, argsPath) => {
  class FunctionContainer {
    async handler(event) {
      const bindCtx = {
        ctx: this.ctx,
        event,
      };

      let args = getValue(bindCtx, argsPath || 'ctx.request.body.args', []);
      if (typeof args === 'string') {
        args = JSON.parse(args);
      }

      return func.bind(bindCtx)(...args);
    }
  }

  const id = 'bind_func::' + functionName;
  savePropertyInject({
    target: FunctionContainer.prototype,
    targetKey: 'ctx',
  });
  saveProviderId(id, FunctionContainer, true);
  container.bind(id, FunctionContainer);
  saveModule(FUNC_KEY, FunctionContainer);
  attachClassMetadata(
    FUNC_KEY,
    { funHandler: functionName, key: 'handler' },
    FunctionContainer
  );
};

const registerFunctionToIocByConfig = (config, options) => {
  if (!config || !config.functionList) {
    return;
  }

  const { baseDir = process.cwd() } = options || {};

  config.functionList.forEach(functionInfo => {
    const {
      functionName,
      functionFilePath,
      functionHandler,
      argsPath,
    } = functionInfo;

    if (!functionFilePath) {
      return;
    }

    const functionPath = join(baseDir, functionFilePath);

    if (!existsSync(functionPath)) {
      return;
    }

    try {
      const modExports = require(functionPath);
      if (!modExports) {
        return;
      }
      let fun;
      if (functionName) {
        fun = modExports[functionName];
      } else {
        fun = modExports.default || modExports;
      }

      if (typeof fun !== 'function') {
        return;
      }

      registerFunctionToIoc(
        options.context,
        functionHandler || `${functionName || '$default'}.handler`,
        fun,
        argsPath
      );
    } catch (error) {
      console.error(
        `require ${functionPath} error, function info: ${JSON.stringify(
          functionInfo,
          null,
          2
        )}`
      );
      console.error(error);
    }
  });
};

// copy from https://github.com/developit/dlv/blob/master/index.js
const getValue = (obj, key, def, p, undef) => {
  key = key.split ? key.split('.') : key;
  for (p = 0; p < key.length; p++) {
    obj = obj ? obj[key[p]] : undef;
  }
  return obj === undef ? def : obj;
};

module.exports = {
  registerFunctionToIocByConfig,
  registerFunctionToIoc,
};
