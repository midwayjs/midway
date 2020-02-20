module.exports = function(app) {
  app.get('/api/index', 'api')
  app.get('/api', app.controller.api.index)
}
