const { resolve, join } = require('path');
/* eslint-disable node/no-unpublished-require */
const { start } = require('egg');
const os = require('os');
const fs = require('fs');
const request = require('request');

const socketPath = join(os.tmpdir(), `server-${Date.now()}.sock`);

module.exports = engine => {
  let eggApp;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      const baseDir = runtime.getPropertyParser().getEntryDir();
      let isMidway3 = false;
      try {
        const midwayFrameworkPkg = require('@midwayjs/web/package.json');
        if (
          process.env.FRAMEWORK_EGG_MODE !== 'true' &&
          /^3/.test(midwayFrameworkPkg.version)
        ) {
          isMidway3 = true;
        }
      } catch (e) {
        // ignore
      }

      if (isMidway3) {
        try {
          const bootstrap = require(join(baseDir, 'bootstrap'));
          eggApp = await bootstrap({
            globalConfig: {
              default: require('./framework/config/config.default'),
            },
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        let framework = '';
        // 从 package.json 中获取 egg 框架
        const packageJSON = require(resolve(baseDir, 'package.json'));
        framework = packageJSON.egg && packageJSON.egg.framework;
        // 支持自定义框架
        if (
          packageJSON['dependencies'] &&
          packageJSON['dependencies']['@midwayjs/web'] &&
          framework !== '@midwayjs/web'
        ) {
          framework = '@midwayjs/web';
        }
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
      }

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
        if (eggApp.config.proxy && !context.headers['X-Forwarded-For']) {
          context.headers['X-Forwarded-For'] = context.ip;
        }
        // fix path for special characters, eg chinese.
        const path = encodeURI(context.path);
        const requestOption = {
          uri: `http://unix:${socketPath}:${path}`,
          qs: context.query,
          method: context.method,
          headers: context.headers,
          followRedirect: false,
        };
        if (context.method === 'GET') {
          // get 统一使用 buffer 返回，避免静态资源无法展示
          requestOption.encoding = null;
        }
        if (
          (context.headers['content-type'] || '').indexOf('application/json') >=
          0
        ) {
          // post json
          if (typeof context.request.body !== 'string') {
            requestOption.body = JSON.stringify(context.request.body);
          } else {
            requestOption.body = context.request.body;
          }
        } else if (
          (context.headers['content-type'] || '').indexOf('multipart/') >= 0
        ) {
          // use buffer from context.req.body
          requestOption.body = context.req.body;
        } else if (
          (context.headers['content-type'] || '').indexOf('form-urlencoded') >=
          0
        ) {
          // post formdata
          requestOption.form = context.request.body;
        } else if (context.request.body) {
          console.warn(
            '[egg-layer] unknown content-type:',
            context.headers['content-type']
          );
          if (typeof context.request.body !== 'string') {
            requestOption.form = context.request.body;
          } else {
            requestOption.body = context.request.body;
          }
        }
        request(requestOption, (error, response, body) => {
          if (error) {
            context.status = 500;
            console.error('[egg-layer]' + error);
            resolve('Internal Server Error');
          } else {
            context.res = response;
            context.status = response.statusCode;
            resolve(body);
          }
        });
      });
    },
  });
};
