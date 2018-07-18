'use strict';

module.exports = class Obj2 {
  static getInstance() {
    return new Obj2();
  }

  say1() {
    return 'say1 hello';
  }

  async say2() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('say2 hello');
      }, 500);
    });
  }
};
