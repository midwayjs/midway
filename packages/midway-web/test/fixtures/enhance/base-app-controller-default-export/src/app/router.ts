module.exports = function(app) {
  app.get('/api/index', app.generateController('baseApi.index'));
};
