const connect = require('passport/lib/framework/connect')
connect.__monkeypatchNode = function() {}

export { PassportConfiguration as Configuration } from './configuration';
export * from './decorators';
export * from './contants';
export * from './adapter/web';
export * from './adapter/express';
export * from './passport';
