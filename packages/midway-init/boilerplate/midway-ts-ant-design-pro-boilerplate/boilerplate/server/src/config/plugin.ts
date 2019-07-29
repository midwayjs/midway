import { EggPlugin } from 'midway';
export default {
  static: true, // default is true

  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },

  assets: {
    enable: true,
    package: 'egg-view-assets',
  },
} as EggPlugin;
