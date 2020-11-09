import { asyncWrapper, start } from '@midwayjs/serverless-fc-starter';

exports.init = asyncWrapper(async () => {
  await start();
});

exports.handler = (req, res, context) => {
  res.send('hello Alan');
};
