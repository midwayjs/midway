module.exports = function(app) {
  app.get('/api/test', app.controller.api.index);
};
