import { asyncWrapper, start } from '@midwayjs/serverless-fc-starter';

exports.init = asyncWrapper(async () => {
  await start();
});

exports.handler = (event, context, callback) => {
  callback(null, event);
};
