import { decorators } from 'injection';

const key = 'count';
decorators.register(key, () => {
  return (target, key, descriptor) => {
    // fetch descriptor
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }
    const oldRoute = descriptor.value;
    // hijack for count time
    descriptor.value = (...args) => {
      console.time('hi');
      oldRoute.apply(target, args);
      console.timeEnd('hi');
    };
    return descriptor;
  };
});

module.exports = (app) => {
  // register count time
  app.coreLogger.info('after register');
  const list = app.decorators.list(key);
  list.map(([target, attr, recv]) => {
    app.coreLogger.info('target =', target);
    app.coreLogger.info('attr =', attr, 'recv =', recv);
  });
};
