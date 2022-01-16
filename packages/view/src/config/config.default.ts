import { join } from 'path';

export default appInfo => ({
  /**
   * view default config
   * @member Config#view
   * @property {String} [rootDir=${appDir}/view] - give a path to find the file, object.values() got array and find for view file
   * @property {Boolean} [cache=true] - whether cache the file's path
   * @property {String} [defaultExtension] - defaultExtension can be added automatically when there is no extension  when call `ctx.render`
   * @property {String} [defaultViewEngine] - set the default view engine if you don't want specify the viewEngine every request.
   * @property {Object} mapping - map the file extension to view engine, such as `{ '.ejs': 'ejs' }`
   */
  view: {
    cache: true,
    defaultExtension: '.html',
    defaultViewEngine: '',
    mapping: {},
    rootDir: {
      default: join(appInfo.appDir, 'view'),
    },
  },
});
