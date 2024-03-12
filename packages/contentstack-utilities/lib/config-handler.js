"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const conf_1 = tslib_1.__importDefault(require("conf"));
const has_1 = tslib_1.__importDefault(require("lodash/has"));
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const _1 = require(".");
const ENC_KEY = process.env.ENC_KEY || 'encryptionKey';
const ENCRYPT_CONF = (0, has_1.default)(process.env, 'ENCRYPT_CONF') ? process.env.ENCRYPT_CONF === 'true' : true;
const CONFIG_NAME = process.env.CONFIG_NAME || 'contentstack_cli';
const ENC_CONFIG_NAME = process.env.ENC_CONFIG_NAME || 'contentstack_cli_obfuscate';
const OLD_CONFIG_BACKUP_FLAG = 'isOldConfigBackup';
const xdgBasedir = require('xdg-basedir');
const path = require('path');
const os = require('os');
const uniqueString = require('unique-string');
const oldConfigDirectory = xdgBasedir.config || path.join(os.tmpdir(), uniqueString());
const pathPrefix = path.join('configstore', `${CONFIG_NAME}.json`);
const oldConfigPath = path.join(oldConfigDirectory, pathPrefix);
const cwd = process.env.CS_CLI_CONFIG_PATH;
class Config {
    constructor() {
        this.init();
        this.importOldConfig();
    }
    init() {
        return ENCRYPT_CONF === true ? this.getEncryptedConfig() : this.getDecryptedConfig();
    }
    importOldConfig() {
        if (!this.get(OLD_CONFIG_BACKUP_FLAG)) {
            try {
                const oldConfigStoreData = this.getOldConfig();
                if (oldConfigStoreData) {
                    this.setOldConfigStoreData(oldConfigStoreData, '');
                    this.removeOldConfigStoreFile();
                }
            }
            catch (error) {
                console.log('No data to be imported from Old config file');
            }
            this.set(OLD_CONFIG_BACKUP_FLAG, true);
        }
    }
    // Recursive function to migrate from the old config
    setOldConfigStoreData(data, _path = '') {
        for (const key in data) {
            const value = data[key];
            const setPath = _path ? _path + '.' + key : key;
            if (typeof value == 'object') {
                this.setOldConfigStoreData(value, setPath);
            }
            else {
                this.set(setPath, value);
            }
        }
    }
    removeOldConfigStoreFile() {
        if ((0, fs_1.existsSync)(oldConfigPath)) {
            (0, fs_1.unlinkSync)(oldConfigPath); // NOTE remove old configstore file
        }
    }
    getOldConfig() {
        try {
            return JSON.parse((0, fs_1.readFileSync)(oldConfigPath, 'utf8'));
        }
        catch (error) {
            return undefined;
        }
    }
    fallbackInit() {
        return new conf_1.default({ configName: CONFIG_NAME, encryptionKey: ENC_KEY });
    }
    getObfuscationKey() {
        const obfuscationKeyName = 'obfuscation_key';
        const encConfig = new conf_1.default({ configName: ENC_CONFIG_NAME, cwd });
        let obfuscationKey = encConfig === null || encConfig === void 0 ? void 0 : encConfig.get(obfuscationKeyName);
        if (!obfuscationKey) {
            encConfig.set(obfuscationKeyName, (0, uuid_1.v4)());
            obfuscationKey = encConfig === null || encConfig === void 0 ? void 0 : encConfig.get(obfuscationKeyName);
        }
        return obfuscationKey;
    }
    getConfigDataAndUnlinkConfigFile(config) {
        let configData;
        if (config === null || config === void 0 ? void 0 : config.path) {
            if ((0, fs_1.existsSync)(config.path)) {
                configData = JSON.parse(JSON.stringify((config === null || config === void 0 ? void 0 : config.store) || {})); // NOTE convert prototype object to plain object
                (0, fs_1.unlinkSync)(config.path); // NOTE remove old config file
            }
        }
        return configData;
    }
    getEncryptedConfig(configData, skip = false) {
        const getEncryptedDataElseFallBack = () => {
            var _a;
            try {
                // NOTE reading current code base encrypted file if exist
                const encryptionKey = this.getObfuscationKey();
                this.config = new conf_1.default({ configName: CONFIG_NAME, encryptionKey, cwd });
                if ((_a = Object.keys(configData || {})) === null || _a === void 0 ? void 0 : _a.length) {
                    this.config.set(configData); // NOTE set config data if passed any
                }
            }
            catch (error) {
                // NOTE reading old code base encrypted file if exist
                try {
                    const config = this.fallbackInit();
                    const oldConfigData = this.getConfigDataAndUnlinkConfigFile(config);
                    this.getEncryptedConfig(oldConfigData, true);
                }
                catch (_error) {
                    _1.cliux.print(chalk_1.default.red('Error: Config file is corrupted'));
                    _1.cliux.print(_error);
                    process.exit(1);
                }
            }
        };
        try {
            if (skip === false) {
                const config = new conf_1.default({ configName: CONFIG_NAME });
                const oldConfigData = this.getConfigDataAndUnlinkConfigFile(config);
                this.getEncryptedConfig(oldConfigData, true);
            }
            else {
                getEncryptedDataElseFallBack();
            }
        }
        catch (error) {
            // console.trace(error.message)
            // NOTE reading current code base encrypted file if exist
            getEncryptedDataElseFallBack();
        }
        return this.config;
    }
    getDecryptedConfig(configData) {
        var _a;
        try {
            this.config = new conf_1.default({ configName: CONFIG_NAME, cwd });
            if ((_a = Object.keys(configData || {})) === null || _a === void 0 ? void 0 : _a.length) {
                this.config.set(configData); // NOTE set config data if passed any
            }
        }
        catch (error) {
            // console.trace(error.message)
            try {
                const encryptionKey = this.getObfuscationKey();
                let config = new conf_1.default({ configName: CONFIG_NAME, encryptionKey, cwd });
                const oldConfigData = this.getConfigDataAndUnlinkConfigFile(config);
                this.getDecryptedConfig(oldConfigData); // NOTE NOTE reinitialize the config with old data and new decrypted file
            }
            catch (_error) {
                // console.trace(error.message)
                try {
                    const config = this.fallbackInit();
                    const _configData = this.getConfigDataAndUnlinkConfigFile(config);
                    this.getDecryptedConfig(_configData); // NOTE reinitialize the config with old data and new decrypted file
                }
                catch (__error) {
                    // console.trace(error.message)
                    _1.cliux.print(chalk_1.default.red('Error: Config file is corrupted'));
                    _1.cliux.print(_error);
                    process.exit(1);
                }
            }
        }
        return this.config;
    }
    get(key) {
        var _a;
        return (_a = this.config) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    set(key, value) {
        var _a;
        (_a = this.config) === null || _a === void 0 ? void 0 : _a.set(key, value);
        return this.config;
    }
    delete(key) {
        var _a;
        (_a = this.config) === null || _a === void 0 ? void 0 : _a.delete(key);
        return this.config;
    }
    clear() {
        var _a;
        (_a = this.config) === null || _a === void 0 ? void 0 : _a.clear();
    }
}
exports.default = new Config();
