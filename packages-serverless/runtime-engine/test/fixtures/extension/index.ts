import assert = require('assert');
import { ServerlessAbstractRuntime } from '../../../src';

export const initialize = (runtime) => {
  assert(runtime instanceof ServerlessAbstractRuntime)
};

export const handler = async ctx => {
  return ctx.myValue + 'Hello, world!';
};
