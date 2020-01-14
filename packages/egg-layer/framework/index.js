const egg = require('egg');

const EGG_PATH = Symbol.for('egg#eggPath');
exports.getFramework = (framework) => {
    const customerEgg = framework ? require(framework) : egg;
    function extendsBase(BaseClass) {
        return class LayerWrapper extends BaseClass {
            get [EGG_PATH]() {
                return __dirname;
            }
            createAnonymousContext(req) {
                const ctx = super.createAnonymousContext(req);
                if (req && req.fctx) {
                    ctx.request.fctx = req.fctx;
                }
                return ctx;
            }

        }
    }
    exports.Agent = extendsBase(customerEgg.Agent)
    exports.Application = extendsBase(customerEgg.Application);
}
