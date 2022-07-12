const { Bootstrap } = require('../../../../bootstrap');

// 加载框架并执行
Bootstrap
  .configure({
    imports: [
      require('./src/index')
    ]
  })
  .run();
