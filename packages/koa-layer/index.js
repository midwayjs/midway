const { join } = require('path');

module.exports = engine => {
  let handleRequest;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      const baseDir = runtime.getPropertyParser().getEntryDir();
      const koaApp = require(join(baseDir, 'app'));
      handleRequest = koaApp.callback();
    },

    async defaultInvokeHandler(context) {
      return new Promise(resolve => {
        handleRequest(
          context.req,
          Object.assign(context.res, {
            end: result => {
              resolve(result);
            },
          })
        );
      });
    },
  });
};
