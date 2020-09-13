const {
  saveModule,
  saveProviderId,
  FUNC_KEY,
  attachClassMetadata,
  savePropertyInject,
} = require('@midwayjs/decorator');
const { join } = require('path');
const { existsSync } = require('fs');

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
      const args =
        (this.ctx &&
          this.ctx.request &&
          this.ctx.request.body &&
          this.ctx.request.body.args) ||
        [];

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
    const { functionName, functionFilePath, functionHandler } = functionInfo;

    if (!functionFilePath) {
      return;
    }

    const functionPath = join(baseDir, functionFilePath);

    if (!existsSync(functionPath)) {
      return;
    }

    try {
      const modExports = require(functionPath);
      if (!modExports || !modExports[functionName]) {
        return;
      }

      registerFunctionToIoc(
        options.context,
        functionHandler || `${functionName}.handler`,
        modExports[functionName]
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

module.exports = {
  registerFunctionToIocByConfig,
  registerFunctionToIoc,
};
