module.exports = {
  get baseDir() {
    return this.loader.baseDir;
  },

  get appDir() {
    return this.loader.appDir;
  },

  get webFramework() {
    return this.loader.framework;
  },
};
