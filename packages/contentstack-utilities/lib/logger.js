"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const tslib_1 = require("tslib");
const traverse_1 = tslib_1.__importDefault(require("traverse"));
const full_1 = require("klona/full");
const path_1 = tslib_1.__importStar(require("path"));
const winston_1 = tslib_1.__importDefault(require("winston"));
const index_1 = require("./index");
class LoggerService {
    static dateFormat() {
        return new Date(Date.now()).toUTCString();
    }
    constructor(pathToLog, name) {
        this.data = null;
        this.name = null;
        const logger = winston_1.default.createLogger({
            transports: [
                new winston_1.default.transports.File({
                    filename: path_1.default.resolve(process.env.CS_CLI_LOG_PATH || `${pathToLog}/logs`, `${name}.log`),
                }),
            ],
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf((info) => {
                let stringifiedParam;
                try {
                    stringifiedParam = JSON.stringify(info.obj);
                }
                catch (error) {
                    console.log('warning: failed to log the result');
                }
                // parse message
                info.message = index_1.messageHandler.parse(info.message);
                let message = `${LoggerService.dateFormat()} : ${name}: ${info.level} : ${info.message}`;
                message = info.obj ? message + `:${stringifiedParam}` : message;
                message = this.data ? message + `:${JSON.stringify(this.data)}` : message;
                return message;
            })),
        });
        this.logger = logger;
    }
    init(context) {
        var _a, _b;
        this.name = (_b = (_a = context === null || context === void 0 ? void 0 : context.plugin) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'cli';
    }
    set loggerName(name) {
        this.name = name;
    }
    setLogData(data) {
        this.data = data;
    }
    async info(message, param) {
        if (param) {
            this.logger.log('info', message, {
                obj: param,
            });
        }
        else {
            this.logger.log('info', message);
        }
    }
    async debug(message, param) {
        if (param) {
            this.logger.log('debug', message, {
                obj: param,
            });
        }
        else {
            this.logger.log('debug', message);
        }
    }
    async error(message, param) {
        if (param) {
            this.logger.log('error', message, {
                obj: param,
            });
        }
        else {
            this.logger.log('error', message);
        }
    }
    async warn(message, param) {
        if (param) {
            this.logger.log('warn', message, {
                obj: param,
            });
        }
        else {
            this.logger.log('warn', message);
        }
    }
}
exports.LoggerService = LoggerService;
/* The Logger class is a TypeScript class that provides logging functionality using the winston
library, with support for redacting sensitive information and different log levels. */
class Logger {
    /**
     * The function returns an object with options for a file logger in the winston library.
     * @returns an object of type `winston.transports.FileTransportOptions`.
     */
    get loggerOptions() {
        return {
            filename: '',
            maxFiles: 20,
            tailable: true,
            maxsize: 1000000,
        };
    }
    /**
     * The constructor function initializes the class with a configuration object and creates logger
     * instances.
     * @param config - The `config` parameter is an object that contains various configuration options
     * for the constructor. It is of type `Record<string, any>`, which means it can have any number of
     * properties of any type.
     */
    constructor(config) {
        /* The `sensitiveKeys` array is used to store regular expressions that match sensitive keys. These
        keys are used to redact sensitive information from log messages. When logging an object, any keys
        that match the regular expressions in the `sensitiveKeys` array will be replaced with the string
        '[REDACTED]'. This helps to prevent sensitive information from being logged or displayed. */
        this.sensitiveKeys = [
            /authtoken/i,
            /^email$/,
            /^password$/i,
            /secret/i,
            /token/i,
            /api[-._]?key/i,
            /management[-._]?token/i,
        ];
        this.config = config;
        this.logger = this.getLoggerInstance();
        this.errorLogger = this.getLoggerInstance('error');
        this.hiddenErrorLogger = this.getLoggerInstance('hidden');
    }
    /**
     * The function getLoggerInstance creates and returns a winston logger instance with specified log
     * level and transports.
     * @param {'error' | 'info' | 'hidden'} [level=info] - The `level` parameter is an optional parameter
     * that specifies the logging level. It can have one of three values: 'error', 'info', or 'hidden'.
     * The default value is 'info'.
     * @returns an instance of the winston.Logger class.
     */
    getLoggerInstance(level = 'info') {
        const filePath = (0, path_1.normalize)(process.env.CS_CLI_LOG_PATH || this.config.basePath).replace(/^(\.\.(\/|\\|$))+/, '');
        const transports = [];
        if (level !== 'hidden') {
            transports.push(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true })),
            }));
        }
        transports.push(new winston_1.default.transports.File(Object.assign(Object.assign({}, this.loggerOptions), { level: level === 'hidden' ? 'error' : level, filename: `${filePath}/${level === 'hidden' ? 'error' : level}.log` })));
        return winston_1.default.createLogger({
            levels: level === 'error' || level === 'hidden'
                ? { error: 0 }
                : {
                    warn: 1,
                    info: 2,
                    debug: 3,
                },
            level,
            transports,
            format: winston_1.default.format.combine(winston_1.default.format((info) => this.redact(info))(), winston_1.default.format.errors({ stack: level === 'hidden' }), // NOTE keep stack only for the hidden type
            winston_1.default.format.simple(), winston_1.default.format.timestamp(), winston_1.default.format.metadata()),
        });
    }
    /**
     * The function checks if a given key string matches any of the sensitive keys defined in an array.
     * @param {string} keyStr - The parameter `keyStr` is a string that represents a key.
     * @returns a boolean value. It returns true if the keyStr matches any of the regular expressions in
     * the sensitiveKeys array, and false otherwise.
     */
    isSensitiveKey(keyStr) {
        if (keyStr && typeof keyStr === 'string') {
            return this.sensitiveKeys.some((regex) => regex.test(keyStr));
        }
    }
    /**
     * The function redactObject takes an object as input and replaces any sensitive keys with the string
     * '[REDACTED]'.
     * @param {any} obj - The `obj` parameter is an object that you want to redact sensitive information
     * from.
     */
    redactObject(obj) {
        const self = this;
        (0, traverse_1.default)(obj).forEach(function redactor() {
            if (self.isSensitiveKey(this.key)) {
                this.update('[REDACTED]');
            }
        });
    }
    /**
     * The redact function takes an object, creates a copy of it, redacts sensitive information from the
     * copy, and returns the redacted copy.
     * @param {any} obj - The `obj` parameter is of type `any`, which means it can accept any type of
     * value. It is the object that needs to be redacted.
     * @returns The `redact` function is returning a copy of the `obj` parameter with certain properties
     * redacted.
     */
    redact(obj) {
        try {
            const copy = (0, full_1.klona)(obj);
            this.redactObject(copy);
            const splat = copy[Symbol.for('splat')];
            this.redactObject(splat);
            return copy;
        }
        catch (error) {
            return obj;
        }
    }
    /**
     * The function checks if an object is a LogEntry by verifying if it has the properties 'level' and
     * 'message'.
     * @param {any} obj - The `obj` parameter is of type `any`, which means it can be any type of value.
     * @returns a boolean value.
     */
    isLogEntry(obj) {
        return typeof obj === 'object' && 'level' in obj && 'message' in obj;
    }
    log(entryOrMessage, logType, hidden) {
        if (this.isLogEntry(entryOrMessage)) {
            this.logger.log(entryOrMessage);
        }
        else {
            switch (logType) {
                case 'info':
                case 'debug':
                case 'warn':
                    this.logger.log(logType, entryOrMessage);
                    break;
                case 'error':
                    if (hidden) {
                        this.hiddenErrorLogger.error(entryOrMessage);
                    }
                    else {
                        this.errorLogger.error(entryOrMessage);
                        this.hiddenErrorLogger.error(entryOrMessage);
                    }
                    break;
                default:
                    index_1.cliux.print(entryOrMessage, logType || {});
                    break;
            }
        }
    }
}
exports.default = Logger;
