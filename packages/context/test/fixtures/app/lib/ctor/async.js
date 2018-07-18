'use strict';

const Base = require('sdk-base');

class AsyncTest {
  async hello(name) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`hello ${name}`);
      }, 1000);
    });
  }
}

const aa1 = new AsyncTest();

class ReadyTest extends Base {
  async say(name) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`hello ${name}`);
      }, 1000);
    });
  }

  saySync(name) {
    return `hello ${name} sync.`;
  }
}

const rr = new ReadyTest();

module.exports = {
  getInstance() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(aa1);
      }, 500);
    });
  },

  getReady() {
    setTimeout(() => {
      rr.ready(true);
    }, 1500);
    return rr;
  }
};
