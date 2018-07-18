'use strict';

class Base {
  ss() {}
  async hhh2() {
    //
  }
}

class Base1 extends Base {
  ss1() {}
  ss() {}
  async hhh2() {
    //
  }
}

class HelloA extends Base1 {
  constructor(a, b, c) {
    super();
    this.a = a;
    this.b = b;
    this.c = c;
  }
  static hhhll() {}
  say(args, next) {
    const rt = `${this.a}+${this.b}+${this.c}`;
    console.log('asdfad sya', rt);
    return next();
  }
  hhh() { console.log('this is hhh'); }
  bb(args, next) {
    return next();
  }
  async ccc() {
    //
    console.log('kajsdfa');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(11);
      }, 1000);
    });
  }
}

module.exports = HelloA;
