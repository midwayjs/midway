let i = 1;

exports.task = async (ctx) => {
  console.log('hasdf');
  ctx.logger.info(process.pid, 'hehehehe', i++);
};

exports.schedule = {
  type: 'worker',
  interval: 1000,
};
