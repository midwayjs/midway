'use strict';

module.exports = class Helper {
  constructor(command) {
    this.command = command;
    this.inquirer = command.inquirer;
    this.originPrompt = this.inquirer.prompt;
    this.KEY_UP = '\u001b[A';
    this.KEY_DOWN = '\u001b[B';
    this.KEY_LEFT = '\u001b[D';
    this.KEY_RIGHT = '\u001b[C';
    this.KEY_ENTER = '\n';
    this.KEY_SPACE = ' ';
  }

  /**
   * send keys after `inquirer.prompt` trigger
   *
   * @param {Array} actions - each item will be sent after once call, if item is array, then send sub item after a tick
   *
   * @example
   *   mock([ helper.KEY_DOWN + helper.KEY_DOWN, [ 'test', 'this is xxx', 'TZ' ]]);
   */
  mock(actions) {
    this.inquirer.prompt = opts => {
      const result = this.originPrompt.call(this.inquirer, opts);
      const key = actions.shift() || '\n';
      if (key) {
        if (Array.isArray(opts) && !Array.isArray(key)) {
          throw new Error(`prompt multiple question, but mock with only one key \`${key}\`, should provide array`);
        } else {
          this.sendKey(key);
        }
      }
      return result;
    };
  }

  /**
   * restore prompt to origin fn
   */
  restore() {
    this.inquirer.prompt = this.originPrompt;
  }

  /**
   * send key to process.stdin
   *
   * @param {String/Array} arr - key list, send one by one after a tick
   * @return {Promise} after all sent
   */
  sendKey(arr) {
    if (Array.isArray(arr)) {
      return arr.reduce((promise, key) => {
        return promise.then(() => this.sendKey(key));
      }, Promise.resolve());
    } else {
      const key = arr;
      return new Promise(resolve => {
        setTimeout(() => {
          process.stdin.emit('data', key + '\n');
          resolve(key);
        }, 10);
      });
    }
  }
};
