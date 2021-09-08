const WebFramework = require('@midwayjs/koa').Framework;
const web = new WebFramework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(web).run();
