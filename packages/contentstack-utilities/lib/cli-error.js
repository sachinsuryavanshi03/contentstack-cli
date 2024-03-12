"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CLIError extends Error {
    constructor(message, suggestions) {
        super(message);
        this.suggestions = suggestions;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}
exports.default = CLIError;
