"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTime = exports.formatDate = void 0;
const formatDate = (date) => {
    return [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
    ].join('');
};
exports.formatDate = formatDate;
const formatTime = (date) => {
    return [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
        date.getSeconds().toString().padStart(2, '0'),
    ].join('');
};
exports.formatTime = formatTime;
