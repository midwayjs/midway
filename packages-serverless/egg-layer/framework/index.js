/* eslint-disable node/no-unpublished-require */
const egg = require('egg');

const EGG_PATH = Symbol.for('egg#eggPath');

exports.getFramework = framework => {
  const customerEgg = framework ? require(framework) : egg;
  function extendsBase(BaseClass) {
    return class LayerWrapper extends BaseClass {
      get [EGG_PATH]() {
        return __dirname;
      }
    };
  }
  exports.Agent = extendsBase(customerEgg.Agent);
  exports.Application = extendsBase(customerEgg.Application);
};
