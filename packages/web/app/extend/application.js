module.exports = {
  get appOptions() {
    return this.options;
  },

  get midwayWebFramework() {
    return this.appOptions['webFramework'];
  },

  get applicationContext() {
    return this.midwayWebFramework.getApplicationContext();
  },

  get baseDir() {
    return this.loader.baseDir;
  },
};
