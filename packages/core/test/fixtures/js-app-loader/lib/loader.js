class Loader {
  getConfig() {
    return {a: 1, b: 2};
  }
}

class EasyLoader extends Loader {
  getConfig() {
    return {a: 3, b: 4};
  }
}

exports.Loader = Loader;
exports.EasyLoader = EasyLoader;
