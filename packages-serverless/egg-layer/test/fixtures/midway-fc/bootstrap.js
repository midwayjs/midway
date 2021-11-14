const { Bootstrap } = require('../../../../../packages/bootstrap');
const { MidwayFrameworkService } = require('../../../../../packages/core');
const { join } = require('path');

module.exports = async (options) => {
  // 加载框架并执行
  await Bootstrap
    .configure({
      appDir: __dirname,
      baseDir: join(__dirname, './src'),
      ...options
    })
    .run();
  const applicationContext = Bootstrap.getApplicationContext();
  const frameworkService = applicationContext.get(MidwayFrameworkService);
  // 返回 app 对象
  return frameworkService.getMainApp();
};
