const { join } = require('path');
const os = require('os');
const fs = require('fs');
const http = require('http');
const querystring = require('querystring');

const socketPath = join(os.tmpdir(), `server-${Date.now()}.sock`);

function getEventBody(event) {
  return Buffer.from(
    JSON.stringify(event.body),
    event.isBase64Encoded ? 'base64' : 'utf8'
  );
}

module.exports = engine => {
  let handleRequest;

  engine.addRuntimeExtension({
    async beforeRuntimeStart(runtime) {
      const baseDir = runtime.getPropertyParser().getEntryDir();
      const koaApp = require(join(baseDir, 'app'));
      // handleRequest = koaApp.callback();
      if (fs.existsSync(socketPath)) {
        fs.unlinkSync(socketPath);
      }
      koaApp.listen(socketPath);
    },

    async defaultInvokeHandler(context) {
      return new Promise(resolve => {
        const options = {
          socketPath,
          method: context.method,
          path: context.path,
          headers: context.headers,
        };

        const callback = res => {
          console.log(`STATUS: ${res.statusCode}`);
          res.setEncoding('utf8');
          res.on('data', data => {
            resolve(data);
            console.log(data);
          });
          res.on('error', data => console.error(data));
        };

        const clientRequest = http.request(options, callback);
        if (context.originEvent) {
          const body = getEventBody(context.originEvent);
          clientRequest.write(body);
        }
        clientRequest.end();

        // handleRequest(
        //   context.req,
        //   Object.assign(context.res, {
        //     end: result => {
        //       resolve(result);
        //     },
        //   })
        // );
      });
    },
  });
};
