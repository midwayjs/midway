'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.redirect('/', '/get');
  router.get('/get', controller.home.getMethod);
  router.get('/get/query', controller.home.getQueryMethod);
  router.post('/post', controller.home.postMethod);
  router.post('/post/body', controller.home.postBodyMethod);
  router.post('/post/formBody', controller.home.postFormBodyMethod);
  router.get('/buffer', controller.home.buffer);
  router.get('/error', controller.home.gotError);
};
