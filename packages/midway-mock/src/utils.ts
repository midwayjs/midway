import * as is from 'is-type-of';
import * as co from 'co';

export async function callFn(fn, args?, ctx?) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) fn = co.wrap(fn);
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

export function getCalleeFromStack(withLine) {
  const limit = Error.stackTraceLimit;
  const prep = Error.prepareStackTrace;

  Error.prepareStackTrace = prepareObjectStackTrace;
  Error.stackTraceLimit = 4;

  // capture the stack
  const obj: any = {};
  Error.captureStackTrace(obj);
  let callSite = obj.stack[2];
  let fileName;
  /* istanbul ignore else */
  if (callSite) {
    // egg-mock will create a proxy
    // https://github.com/eggjs/egg-mock/blob/master/lib/app.js#L174
    fileName = callSite.getFileName();
    /* istanbul ignore if */
    if (fileName && fileName.endsWith('egg-mock/lib/app.js')) {
      // TODO: add test
      callSite = obj.stack[3];
      fileName = callSite.getFileName();
    }
  }

  Error.prepareStackTrace = prep;
  Error.stackTraceLimit = limit;

  /* istanbul ignore if */
  if (!callSite || !fileName) return '<anonymous>';
  if (!withLine) return fileName;
  return `${fileName}:${callSite.getLineNumber()}:${callSite.getColumnNumber()}`;
}

/**
 * Capture call site stack from v8.
 * https://github.com/v8/v8/wiki/Stack-Trace-API
 */

function prepareObjectStackTrace(obj, stack) {
  return stack;
}
