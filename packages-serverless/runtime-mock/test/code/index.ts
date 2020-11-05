'use strict';

exports.handler = (ctx, event) => {
  return 'hello ' + event.query.name;
};
