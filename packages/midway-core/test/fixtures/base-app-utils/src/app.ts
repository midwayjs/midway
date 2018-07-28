module.exports = (app) => {
  const context = app.applicationContext;
  context.registerObject('is', require('is-type-of'));
};
