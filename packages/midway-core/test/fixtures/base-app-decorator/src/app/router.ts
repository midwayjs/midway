module.exports = function(app) {
  app.get('/api/index', app.controller.api)
  app.get('/api/baseService', app.controller.api.baseService)
  app.get('/api', app.controller.api.index)
}
