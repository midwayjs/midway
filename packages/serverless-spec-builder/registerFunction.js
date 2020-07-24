const {
  saveModule,
  saveProviderId,
  FUNC_KEY,
  attachClassMetadata,
} = require('@midwayjs/decorator');
const { join } = require('path');
const { existsSync } = require('fs');
const registerFunctionToIoc = (container, funHandler, fun) => {
  class Fun {
    async handler(event) {
      const _this = {
        context: this['REQUEST_OBJ_CTX_KEY'],
        event,
      };
      const args =
        (_this.context &&
          _this.context.req &&
          _this.context.req.body &&
          _this.context.req.body.args) ||
        [];
      return fun.bind(_this)(...args);
    }
  }
  const id = 'bind_func::' + funHandler;
  saveProviderId(id, Fun, true);
  container.bind(id, Fun);
  saveModule(FUNC_KEY, Fun);
  attachClassMetadata(
    FUNC_KEY,
    Object.assign({ funHandler, key: 'handler' }, {}),
    Fun
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
      const functionExport = require(functionPath);
      if (!functionExport || !functionExport[functionName]) {
        return;
      }
      registerFunctionToIoc(
        options.context,
        functionHandler || `${functionName}.handler`,
        functionExport[functionName]
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
