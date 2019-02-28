# midway-schedule

[![Package Quality](http://npm.packagequality.com/shield/midway-schedule.svg)](http://packagequality.com/#?package=midway-schedule)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/midwayjs/midway/pulls)

this is a sub package for midway.

Document: [https://midwayjs.org/midway](https://midwayjs.org/midway)

## Config

Midway has enabled this plugin by default.

```js
// plugin.ts(js)
exports.schedulePlus = {
  enable: true,
  package: 'midway-schedule'
}
```

## Detail

The schedule of midway is based on [egg schedule](https://eggjs.org/en/basics/schedule.html), and provide more typescript and decorator support. The task can store in any file like `src/schedule`, it can be configured the properties and specify jobs. For example:

```typescript
// src/schedule/hello.ts
import { provide, schedule, CommonSchedule } from 'midway';

@provide()
@schedule({
  interval: 2333, // 2.333s interval
  type: 'worker', // only run in certain worker
})
export class HelloCron implements CommonSchedule {
  // The detail job while times up
  async exec(ctx) {
    ctx.logger.info(process.pid, 'hello');
  }
}
```

It is recommended to use `CommonSchedule` interface to standardize your schedule class.

## About run schedule

Egg provides the app.runSchedule method to test the scheduled task. The parameters of the midway are different. The format of the midway parameter is `ioc id#className`.

Take the example of the `HelloCron` class above.

```js
app.runSchedule('helloCron#HelloCron');
```

Please see our test case for more detail.

## License

[MIT]((http://github.com/midwayjs/midway/blob/master/LICENSE))
