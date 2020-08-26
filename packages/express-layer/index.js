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
      if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
      }
      app.listen(socketPath);
    },

    async defaultInvokeHandler(context) {
      return new Promise((resolve, reject) => {
        delete context.headers['content-length'];
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
