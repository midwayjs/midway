'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/get', controller.home.getMethod);
  router.get('/post', controller.home.postMethod);
  router.get('/buffer', controller.home.buffer);
};
