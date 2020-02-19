"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cursor_1 = __importDefault(require("./cursor"));
var template = "\n  <span class=\"" + cursor_1.default.SELECTION_CLASS + "\"></span>\n  <span class=\"" + cursor_1.default.CARET_CONTAINER_CLASS + "\">\n    <span class=\"" + cursor_1.default.CARET_CLASS + "\"></span>\n  </span>\n  <div class=\"" + cursor_1.default.FLAG_CLASS + "\">\n    <small class=\"" + cursor_1.default.NAME_CLASS + "\"></small>\n  </div>\n";
exports.default = template;
//# sourceMappingURL=template.js.map