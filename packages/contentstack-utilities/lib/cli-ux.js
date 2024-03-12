"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Args = exports.Flags = void 0;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const core_1 = require("@oclif/core");
Object.defineProperty(exports, "Args", { enumerable: true, get: function () { return core_1.Args; } });
Object.defineProperty(exports, "Flags", { enumerable: true, get: function () { return core_1.Flags; } });
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return core_1.Command; } });
const ora_1 = tslib_1.__importDefault(require("ora"));
const message_handler_1 = tslib_1.__importDefault(require("./message-handler"));
inquirer_1.default.registerPrompt('table', require('./inquirer-table-prompt'));
/**
 * CLI Interface
 */
class CLIInterface {
    constructor() {
        this.loading = false;
    }
    get uxTable() {
        return core_1.ux.table;
    }
    init(context) { }
    registerSearchPlugin() {
        inquirer_1.default.registerPrompt('search-list', require('inquirer-search-list'));
        inquirer_1.default.registerPrompt('search-checkbox', require('inquirer-search-checkbox'));
    }
    print(message, opts) {
        if (opts) {
            let chalkFn = chalk_1.default;
            if (opts.color)
                chalkFn = chalkFn[opts.color];
            if (opts.bold)
                chalkFn = chalkFn.bold;
            core_1.ux.log(chalkFn(message_handler_1.default.parse(message)));
            return;
        }
        core_1.ux.log(message_handler_1.default.parse(message));
    }
    success(message) {
        core_1.ux.log(chalk_1.default.green(message_handler_1.default.parse(message)));
    }
    error(message, ...params) {
        core_1.ux.log(chalk_1.default.red(message_handler_1.default.parse(message) + (params && params.length > 0 ? ': ' : '')), ...params);
    }
    loader(message = '') {
        if (!this.loading) {
            core_1.ux.action.start(message_handler_1.default.parse(message));
        }
        else {
            core_1.ux.action.stop(message_handler_1.default.parse(message));
        }
        this.loading = !this.loading;
    }
    table(data, columns, options) {
        core_1.ux.log('\n');
        core_1.ux.table(data, columns, options);
        core_1.ux.log('\n');
    }
    async inquire(inquirePayload) {
        if (Array.isArray(inquirePayload)) {
            return inquirer_1.default.prompt(inquirePayload);
        }
        else {
            inquirePayload.message = message_handler_1.default.parse(inquirePayload.message);
            const result = await inquirer_1.default.prompt(inquirePayload);
            return result[inquirePayload.name];
        }
    }
    prompt(name, options) {
        return core_1.ux.prompt(name, options);
    }
    confirm(message) {
        return core_1.ux.confirm(message);
    }
    progress(options) {
        return core_1.ux.progress(options);
    }
    loaderV2(message = '', spinner) {
        if (!spinner) {
            return (0, ora_1.default)(message).start();
        }
        else {
            spinner.text = message;
            spinner.stop();
        }
    }
}
exports.default = new CLIInterface();
