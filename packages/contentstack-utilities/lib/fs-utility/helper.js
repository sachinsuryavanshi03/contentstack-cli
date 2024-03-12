"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaData = exports.mapKeyAndVal = void 0;
const tslib_1 = require("tslib");
const map_1 = tslib_1.__importDefault(require("lodash/map"));
const omit_1 = tslib_1.__importDefault(require("lodash/omit"));
const pick_1 = tslib_1.__importDefault(require("lodash/pick"));
const assign_1 = tslib_1.__importDefault(require("lodash/assign"));
const isEmpty_1 = tslib_1.__importDefault(require("lodash/isEmpty"));
const forEach_1 = tslib_1.__importDefault(require("lodash/forEach"));
function getKeysFromArray(keys, obj) {
    let keyName = "";
    (0, forEach_1.default)(keys, (key) => {
        keyName += keyName ? `_${obj[key]}` : obj[key];
    });
    return keyName;
}
function mapKeyAndVal(array, keyName, omitKeys = []) {
    return (0, assign_1.default)({}, ...(0, map_1.default)(array, (row) => {
        if (Array.isArray(keyName))
            return { [getKeysFromArray(keyName, row)]: (0, omit_1.default)(row, omitKeys) };
        return { [row[keyName]]: (0, omit_1.default)(row, omitKeys) };
    }));
}
exports.mapKeyAndVal = mapKeyAndVal;
function getMetaData(array, pickKeys, handler) {
    if (handler instanceof Function)
        handler(array);
    if ((0, isEmpty_1.default)(array) || (0, isEmpty_1.default)(pickKeys))
        return;
    return (0, map_1.default)(array, (row) => (0, pick_1.default)(row, pickKeys));
}
exports.getMetaData = getMetaData;
