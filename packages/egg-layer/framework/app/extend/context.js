'use strict';

module.exports = {
    get fctx() {
        if (!this.request.fctx) {
            return this.app;
        }
        return this.request.fctx;
    },
};
