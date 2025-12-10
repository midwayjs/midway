'use strict'

function hello() {
  return 1;
}

hello.hello = hello;

module.exports = hello;

