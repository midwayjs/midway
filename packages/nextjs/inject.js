// hack-start-server.js
const path = require('path');
const startServerModule = require('next/dist/server/lib/start-server');
const originalStartServer = startServerModule.startServer;
const { Bootstrap } = require('@midwayjs/bootstrap');

// create a new startServer function
const newStartServer = async function (options) {
  // init midway
  Bootstrap.configure({
    baseDir: path.resolve(__dirname, './dist/service'),
  });
  await Bootstrap.run();

  // call the original startServer function
  return originalStartServer(options);
};

// use Proxy to intercept the access to startServerModule
const proxy = new Proxy(startServerModule, {
  get(target, prop, receiver) {
    if (prop === 'startServer') {
      return newStartServer;
    }
    return Reflect.get(target, prop, receiver);
  },
});

// replace the module in require.cache
const modulePath = require.resolve('next/dist/server/lib/start-server');
require.cache[modulePath].exports = proxy;
