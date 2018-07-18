'use strict';

const _ = require('lodash');

exports.beforeSay = (args, next) => {
  return 'before say' + args.length + next();
};

exports.asyncAroundSay = async (args, next) => {
  return _.join(args, '-') + 'asyncAroundSay say' + (await next());
};

exports.aroundSay = (args, next) => {
  const b = _.join(args, '-') + 'before exec';
  const rt = next();
  const c = 'after exec';
  return `${b}+${rt}+${c}`;
};
