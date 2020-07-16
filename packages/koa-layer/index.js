const { resolve } = require('path');
const querystring = require('querystring');
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

// function formatReqHeaders(headers) {
//   const realHost = headers['X-Real-Host'] || headers['x-real-host'];
//   let host = realHost || headers.host || headers.Host;
//   if (Array.isArray(host)) {
//     host = host[0];
//   }
//   headers.host = headers.Host = host;
//   return headers;
// }
//
// function makeRequest(fctx) {
//   const { req } = fctx;
//   const queryStr = querystring.stringify(req.query);
//   const request = new EventEmitter();
//   const headers = formatReqHeaders(req.headers);
//   Object.assign(request, {
//     fctx,
//     headers,
//     body: req.body, // 并没什么用
//     query: req.query,
//     querystring: queryStr,
//     host: headers.host,
//     hostname: headers.host,
//     method: req.method,
//     url: queryStr ? req.path + '?' + queryStr : req.path,
//     path: req.path,
//     socket: {
//       remoteAddress: headers['x-remote-ip'],
//       remotePort: 7001,
//     },
//   });
//   return request;
// }
