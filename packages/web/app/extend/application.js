module.exports = {
  get midwayWebFramework() {
    return this.options['webFramework'];
  },

  get applicationContext() {
    return this.midwayWebFramework.getApplicationContext();
  },

  get baseDir() {
    return this.loader.baseDir;
  },
};
