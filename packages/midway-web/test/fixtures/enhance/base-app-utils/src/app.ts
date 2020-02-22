module.exports = (app) => {
  const context = app.getApplicationContext();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  context.registerObject('is', require('is-type-of'));
};
