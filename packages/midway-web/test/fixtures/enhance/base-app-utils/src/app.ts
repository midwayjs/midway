module.exports = (app) => {
  const context = app.getApplicationContext()
  context.registerObject('is', require('is-type-of'))
}
