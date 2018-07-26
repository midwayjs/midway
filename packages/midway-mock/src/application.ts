import {getCalleeFromStack, callFn} from './utils';

export class MidwayMockApplication {

  options;
  readyCallback: (time) => any;

  constructor(options) {
    this.options = options;
    require('ready-callback')({ timeout: 10000 }).mixin(this);
  }

  beforeStart(scope) {
    // get filename from stack
    const name = getCalleeFromStack(true);
    const done = this.readyCallback(name);

    // ensure scope executes after load completed
    process.nextTick(() => {
      callFn(scope).then(() => {
        done();
      }, err => {
        done(err);
      });
    });
  }

  get [Symbol.for('egg#loader')]() {
    return __dirname;
  }

  get [Symbol.for('egg#eggPath')]() {
    return __dirname;
  }

}
