module.exports = function(app) {
  app.get('/api/index', app.controller.api);
  app.get('/api', app.controller.api.index);
};
