import * as path from 'path';


export = (app) => {
  app.beforeStart(() => {
    app.loader.loadController({
      directory: [path.join(app.baseDir, 'io', 'controller')],
      target: {},
    });
  });
};
