module.exports = function(app) {
  const {applicationContext} = app;
  const apiController = applicationContext.get('baseApi');
  app.get('/api/index', apiController.index);
};
