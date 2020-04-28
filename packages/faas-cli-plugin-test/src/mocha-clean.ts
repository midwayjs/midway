'use strict';

const mochaMod = require('mocha');
const internal = [
  '(timers.js:',
  '(node.js:',
  '(module.js:',
  '(domain.js:',
  'GeneratorFunctionPrototype.next (native)',
  'at Generator.next',
  /at process\._tickDomainCallback \(.*\)/,
  /at emitCloseNT \(net\.js.*\)/,
  /at _combinedTickCallback \(internal.*\)/,
  // node 8.x
  'at Promise (<anonymous>)',
  'at next (native)',
  '__mocha_internal__',
  /node_modules\/.*empower-core\//,
  /node_modules\/.*mocha\//,
  /node_modules\/.*co\//,
  /node_modules\/.*co-mocha\//,
  /node_modules\/.*supertest\//,
];

// monkey-patch `Runner#fail` to modify stack
const originFn = mochaMod.Runner.prototype.fail;
mochaMod.Runner.prototype.fail = function(test, err) {
  /* istanbul ignore else */
  if (err.stack) {
    const stack = err.stack.split('\n').filter(line => {
      line = line.replace(/\\\\?/g, '/');
      return !internal.some(rule => match(line, rule));
    });
    stack.push('    [use `--full-trace` to display the full stack trace]');
    err.stack = stack.join('\n');
  }
  return originFn.call(this, test, err);
};

function match(line, rule) {
  if (rule instanceof RegExp) return rule.test(line);
  return line.includes(rule);
}