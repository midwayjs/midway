const { resolve, join } = require('path');
const { start } = require('egg');
const os = require('os');
const fs = require('fs');
const request = require('request');

const socketPath = join(os.tmpdir(), `server-${Date.now()}.sock`);

module.exports = engine => {
  let eggApp;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      let framework = '';
      const baseDir = runtime.getPropertyParser().getEntryDir();
      // 从 packagejson 中获取 egg 框架
      const packageJSON = require(resolve(baseDir, 'package.json'));
      framework = packageJSON.egg && packageJSON.egg.framework;
      const localFrameWorkPath = resolve(__dirname, 'framework');
      require(localFrameWorkPath).getFramework(
        process.env.EGG_FRAMEWORK_DIR ||
          (framework && resolve(baseDir, 'node_modules', framework))
      );
      eggApp = await start({
        baseDir,
        framework: localFrameWorkPath,
        ignoreWarning: true,
        runtime,
        typescript:
          framework && framework.includes('midway') ? true : undefined,
      });
      if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
      }
      await new Promise(resolve => {
        eggApp.listen(socketPath, () => {
          resolve();
        });
      });
    },
    async beforeClose() {
      await eggApp.close();
      eggApp = null;
    },
    async defaultInvokeHandler(context) {
      return new Promise((resolve, reject) => {
        delete context.headers['content-length'];
        if (
          eggApp &&
          eggApp.config &&
          eggApp.config.proxy &&
          !context.headers['X-Forwarded-For']
        ) {
          context.headers['X-Forwarded-For'] = context.ip;
        }
        request(
          {
            uri: `http://unix:${socketPath}:${context.path}`,
            qs: context.query,
            method: context.method,
            body:
              typeof context.request.body === 'string'
                ? context.request.body
                : JSON.stringify(context.request.body),
            headers: context.headers,
            followRedirect: false,
          },
          (error, response, body) => {
            context.res = response;
            context.status = response.statusCode;
            if (error) {
              reject(error);
            }
            resolve(body);
          }
        );
      });
    },
  });
};
