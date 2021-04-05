const WebFramemwork = require('../../../../web/').Framework;
const SocketFramemwork = require('../../../../socketio/').Framework;
const Bootstrap = require('../../../src/').Bootstrap;

const timeoutHandler = setTimeout(() => {
  clearInterval(internalHandler);
  throw new Error('[midway]: bootstrap timeout');
}, 30 * 1000);

const internalHandler = setInterval(() => {
  if (global['MIDWAY_BOOTSTRAP_APP_READY'] === true) {
    clearInterval(internalHandler);
    clearTimeout(timeoutHandler);
    process.send('ready');
  }
}, 200);

Bootstrap
  .load(globalConfig => {
    // 加载主 web 框架
    const framework = new WebFramemwork();
    framework.configure(globalConfig.cluster);
    return framework;
  })
  .load(globalConfig => {
    // 加载副 socket.io 框架
    const framework = new SocketFramemwork();
    framework.configure();
    return framework;
  })
  .before(async (container) => {
    const configService = await container.getAsync('remoteConfigService');
    const data = await configService.getRemoteConfig();
    container.getConfigService().addObject(data);
  })
  .run();

