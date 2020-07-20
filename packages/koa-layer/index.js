const { join } = require('path');
const os = require('os');
const fs = require('fs');
const request = require('request');

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
      return new Promise((resolve, reject) => {
        request(
            {
              uri: `http://unix:${socketPath}:${context.path}`,
              qs: context.query,
              method: context.method,
              body: typeof context.request.body === 'string' ? context.request.body : JSON.stringify(context.request.body),
              headers: context.headers,
            },
            (error, response, body) => {
              context.res = response;
              if (error) {
                reject(error);
              }
              resolve(body);
            });
      });

      //
      // const response = await fetch(`file://${socketPath}/${context.path}`, {
      //   method: context.method,
      //   body: JSON.stringify(context.body),
      //   headers: context.headers,
      // });
      // const body = await response.text();
      // return body;
      //
      //
      //
      // delete context.headers['content-length'];
      // return new Promise(resolve => {
      //   const options = {
      //     socketPath,
      //     method: context.method,
      //     path: context.path,
      //     headers: context.headers,
      //   };
      //
      //   const callback = res => {
      //     console.log(`STATUS: ${res.statusCode}`);
      //     res.setEncoding('utf8');
      //     const chunks = [];
      //     res.on('data', data => chunks.push(data));
      //     res.on('end', () => {
      //       let body = Buffer.concat(chunks);
      //       switch (res.headers['content-type']) {
      //         case 'application/json':
      //           body = JSON.parse(body);
      //           break;
      //       }
      //       resolve(body);
      //     });
      //   };



      // const clientRequest = http.request(options, callback);
      // if (context.originEvent) {
      //   const body = getEventBody(context.originEvent);
      //   clientRequest.write(body);
      // }
      // clientRequest.end();

      // handleRequest(
      //   context.req,
      //   Object.assign(context.res, {
      //     end: result => {
      //       resolve(result);
      //     },
      //   })
      // );
      // });
    },
  });
};
