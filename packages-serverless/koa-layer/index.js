const { join } = require('path');
const os = require('os');
const fs = require('fs');
const request = require('request');

const socketPath = join(os.tmpdir(), `server-${Date.now()}.sock`);

module.exports = engine => {
  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      const baseDir = runtime.getPropertyParser().getEntryDir();
      let app = require(join(baseDir, 'app'));
      if (typeof app === 'function') {
        app = await app();
      }
      // handleRequest = koaApp.callback();
      if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
      }
      app.listen(socketPath);
    },

    async defaultInvokeHandler(context) {
      return new Promise((resolve, reject) => {
        delete context.headers['content-length'];
        const requestOption = {
          uri: `http://unix:${socketPath}:${context.path}`,
          qs: context.query,
          method: context.method,
          headers: context.headers,
          followRedirect: false,
        };
        if ((context.headers['content-type'] || '').indexOf('application/json') >= 0) {
          // post json
          if (typeof context.request.body !== 'string') {
            requestOption.body = JSON.stringify(context.request.body)
          } else {
            requestOption.body = context.request.body
          }
        } else if ((context.headers['content-type'] || '').indexOf('form-urlencoded') >= 0) {
          // post formdata
          requestOption.form = context.request.body;
        } else if (context.request.body) {
          if (typeof context.request.body !== 'string') {
            requestOption.form = context.request.body;
          } else {
            requestOption.body = context.request.body;
          }
        }
        request(requestOption, (error, response, body) => {
          context.res = response;
          context.status = response.statusCode;
          if (error) {
            console.error('[koa-layer]' + error);
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
