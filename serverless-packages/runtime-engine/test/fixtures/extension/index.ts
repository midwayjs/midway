import { ServerlessBaseRuntime} from '../../../src';
import assert = require('assert');

export const initialize = (runtime) => {
  assert(runtime instanceof ServerlessBaseRuntime)
};

export const handler = async ctx => {
  return ctx.myValue + 'Hello, world!';
};
