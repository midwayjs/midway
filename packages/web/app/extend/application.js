module.exports = {
  get baseDir() {
    return this.loader.baseDir;
  },

  get webFramework() {
    return this.loader.framework;
  },
};
