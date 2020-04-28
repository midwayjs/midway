module.exports = function(app) {

  let plugin2 = {};

  app.beforeStart(async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        plugin2.text = 't';
        resolve();
      }, 10);
    })
  });

  app.plugin2 = plugin2;
};
