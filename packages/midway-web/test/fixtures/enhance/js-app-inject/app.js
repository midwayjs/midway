class App {

  constructor() {
    this.loader = null;
  }

  getConfig() {
    return this.loader.getConfig();
  }
}

module.exports = App;
