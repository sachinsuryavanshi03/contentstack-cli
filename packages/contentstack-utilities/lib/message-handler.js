"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const cli_error_1 = tslib_1.__importDefault(require("./cli-error"));
/**
 * Message handler
 */
class Messages {
    constructor() {
        this.messages = {};
    }
    init(context) {
        if (!context.messageFilePath) {
            return;
        }
        try {
            this.messages = JSON.parse(fs_1.default.readFileSync(context.messageFilePath, 'utf-8'));
        }
        catch (error) {
            // create empty messages object if message file is not exist
            if (error.code === 'ENOENT') {
                this.messages = {};
            }
            else {
                throw new cli_error_1.default(error.message);
            }
        }
    }
    parse(messageKey, ...substitutions) {
        const msg = this.messages[messageKey];
        if (!msg) {
            return messageKey;
        }
        if (substitutions.length > 0) {
            const callSite = msg.split('%s');
            callSite.push('');
            return String.raw({ raw: callSite }, ...substitutions);
        }
        return msg;
    }
}
exports.default = new Messages();
