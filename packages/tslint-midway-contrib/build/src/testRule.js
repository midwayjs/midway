"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new Walk(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = '我感觉你很棒棒哦!';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var Walk = (function (_super) {
    __extends(Walk, _super);
    function Walk() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Walk.prototype.visitDebuggerStatement = function (node) {
        this.addFailureAt(node.getStart(), node.getEnd() - node.getStart(), Rule.FAILURE_STRING, this.fix(node));
        _super.prototype.visitDebuggerStatement.call(this, node);
    };
    Walk.prototype.fix = function (node) {
        return new Lint.Replacement(node.pos, node.end, '');
    };
    return Walk;
}(Lint.RuleWalker));
//# sourceMappingURL=testRule.js.map