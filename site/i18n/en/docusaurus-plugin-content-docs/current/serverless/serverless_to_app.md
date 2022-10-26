# Serverless functions are deployed as applications

Midway Serverless already supports deployment to various Serverless cloud platforms in v1.0 version, such as Aliyun FC, Tencent Cloud SCF, etc. Starting from v2.0 version, existing Serverless functions are supported to be deployed on your private server in application mode.

## premise

`@midwayjs/faas` must be greater than `2.8.7`.

## Use



### 1. Installation application deployment dependency

Mainly `@midwayjs/bootstrap` and `@midwayjs/serverless-app` packages.

```bash
$ npm i @midwayjs/bootstrap @midwayjs/serverless-app --save
```

`@midwayjs/bootstrap` is used to start the upper layer framework of Midway. `@midwayjs/serverless-app` is used to wrap the original function code into actual application running. It is also one of the upper layer Framework of Midway.

### 2. Add startup file

Add the `bootstrap.js` file to the root directory of the project with the following code:

```javascript
// bootstrap.js
const { Bootstrap } = require('@midwayjs/bootstrap');
const { Framework } = require('@midwayjs/serverless-app');
const app = new Framework().configure({
  port: 7001
});

Bootstrap.load(app).run();
```

### 3. Deploy Applications

You can add the `start` command to the `package.json` to facilitate startup.

```json
{
  "scripts": {
    "start": "NODE_ENV=production node bootstrap.js"
  }
}
```

Then, run the `npm run start` command. Also

You can run this command by using a tool such as `pm2`.

`http:// 127.0.0.1:7001` after startup.
