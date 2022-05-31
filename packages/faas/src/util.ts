export const asyncWrapper = handler => {
  return (...args) => {
    if (typeof args[args.length - 1] === 'function') {
      const callback = args.pop();
      if (handler.constructor.name !== 'AsyncFunction') {
        const err = new TypeError('Must be an AsyncFunction');
        return callback(err);
      }
      // 其他事件场景
      return handler.apply(handler, args).then(
        result => {
          callback(null, result);
        },
        err => {
          callback(err);
        }
      );
    } else {
      return handler.apply(handler, args);
    }
  };
};
