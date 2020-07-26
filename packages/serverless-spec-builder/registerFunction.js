const {
  saveModule,
  saveProviderId,
  FUNC_KEY,
  attachClassMetadata,
} = require('@midwayjs/decorator');
const { join } = require('path');
const { existsSync } = require('fs');
const get = require('lodash.get');

const registerFunctionToIoc = (container, functionName, func) => {
  class FunctionContainer {
    async handler(event) {
      const bindCtx = {
        ctx: this.ctx,
        event,
      };

      /**
       * HTTP Case
       */
      const args = get(this.ctx, 'request.body.args', []);

      return func.bind(bindCtx)(...args);
    }
  }

  const id = 'bind_func::' + functionName;

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
    const { functionName, functionFilePath, functionHandler } = functionInfo;

    if (!functionFilePath) {
      return;
    }

    const functionPath = join(baseDir, functionFilePath);

    if (!existsSync(functionPath)) {
      return;
    }

    try {
      const exportMods = require(functionPath);
      if (!exportMods || !exportMods[functionName]) {
        return;
      }

      registerFunctionToIoc(
        options.context,
        functionHandler || `${functionName}.handler`,
        exportMods[functionName]
      );
    } catch {
      //
    }
  });
};

module.exports = {
  registerFunctionToIocByConfig,
  registerFunctionToIoc,
};
