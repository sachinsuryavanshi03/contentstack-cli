import winston, { LogEntry } from 'winston';
import { PrintOptions } from './index';
export declare class LoggerService {
    name: string;
    data: object | null;
    logger: winston.Logger;
    static dateFormat(): string;
    constructor(pathToLog: string, name: string);
    init(context: any): void;
    set loggerName(name: string);
    setLogData(data: object): void;
    info(message: string, param?: any): Promise<any>;
    debug(message: string, param?: any): Promise<any>;
    error(message: string, param?: any): Promise<any>;
    warn(message: string, param?: any): Promise<any>;
}
export type LogType = 'info' | 'warn' | 'error' | 'debug';
export type LogsType = LogType | PrintOptions | undefined;
export type MessageType = string | Error | Record<string, any> | Record<string, any>[];
export default class Logger {
    private logger;
    private errorLogger;
    private hiddenErrorLogger;
    private config;
    private sensitiveKeys;
    /**
     * The function returns an object with options for a file logger in the winston library.
     * @returns an object of type `winston.transports.FileTransportOptions`.
     */
    get loggerOptions(): winston.transports.FileTransportOptions;
    /**
     * The constructor function initializes the class with a configuration object and creates logger
     * instances.
     * @param config - The `config` parameter is an object that contains various configuration options
     * for the constructor. It is of type `Record<string, any>`, which means it can have any number of
     * properties of any type.
     */
    constructor(config: Record<string, any>);
    /**
     * The function getLoggerInstance creates and returns a winston logger instance with specified log
     * level and transports.
     * @param {'error' | 'info' | 'hidden'} [level=info] - The `level` parameter is an optional parameter
     * that specifies the logging level. It can have one of three values: 'error', 'info', or 'hidden'.
     * The default value is 'info'.
     * @returns an instance of the winston.Logger class.
     */
    getLoggerInstance(level?: 'error' | 'info' | 'hidden'): winston.Logger;
    /**
     * The function checks if a given key string matches any of the sensitive keys defined in an array.
     * @param {string} keyStr - The parameter `keyStr` is a string that represents a key.
     * @returns a boolean value. It returns true if the keyStr matches any of the regular expressions in
     * the sensitiveKeys array, and false otherwise.
     */
    isSensitiveKey(keyStr: string): boolean;
    /**
     * The function redactObject takes an object as input and replaces any sensitive keys with the string
     * '[REDACTED]'.
     * @param {any} obj - The `obj` parameter is an object that you want to redact sensitive information
     * from.
     */
    redactObject(obj: any): void;
    /**
     * The redact function takes an object, creates a copy of it, redacts sensitive information from the
     * copy, and returns the redacted copy.
     * @param {any} obj - The `obj` parameter is of type `any`, which means it can accept any type of
     * value. It is the object that needs to be redacted.
     * @returns The `redact` function is returning a copy of the `obj` parameter with certain properties
     * redacted.
     */
    redact(obj: any): any;
    /**
     * The function checks if an object is a LogEntry by verifying if it has the properties 'level' and
     * 'message'.
     * @param {any} obj - The `obj` parameter is of type `any`, which means it can be any type of value.
     * @returns a boolean value.
     */
    isLogEntry(obj: any): obj is LogEntry;
    log(entry: LogEntry): void;
    log(message: MessageType, logType: LogsType): void;
    log(message: MessageType, logType: 'error', hidden: boolean): void;
}
