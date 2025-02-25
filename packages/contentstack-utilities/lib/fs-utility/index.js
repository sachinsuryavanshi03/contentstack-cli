"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileList = exports.getDirectories = exports.FsUtility = exports.mapKeyAndVal = void 0;
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importStar(require("./core"));
exports.FsUtility = core_1.default;
Object.defineProperty(exports, "getDirectories", { enumerable: true, get: function () { return core_1.getDirectories; } });
Object.defineProperty(exports, "getFileList", { enumerable: true, get: function () { return core_1.getFileList; } });
tslib_1.__exportStar(require("./types"), exports);
var helper_1 = require("./helper");
Object.defineProperty(exports, "mapKeyAndVal", { enumerable: true, get: function () { return helper_1.mapKeyAndVal; } });
