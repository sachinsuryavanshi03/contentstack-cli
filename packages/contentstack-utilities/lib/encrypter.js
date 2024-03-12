"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const merge_1 = tslib_1.__importDefault(require("lodash/merge"));
const defaultValues = {
    typeIdentifier: '◈',
    algorithm: 'aes-192-cbc',
    //   file deepcode ignore HardcodedNonCryptoSecret: <This is a ToDo>
    encryptionKey: 'nF2ejRQcTv',
};
class NodeCrypto {
    constructor(config = defaultValues) {
        const { algorithm, encryptionKey, typeIdentifier } = (0, merge_1.default)(defaultValues, config);
        this.algorithm = algorithm;
        this.typeIdentifier = typeIdentifier;
        // deepcode ignore HardcodedSecret: <please specify a reason of ignoring this>
        this.key = crypto_1.default.scryptSync(encryptionKey, 'salt', 24);
    }
    encrypt(plainData) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, iv);
        let data = plainData;
        switch (typeof plainData) {
            case 'number':
                data = `${String(plainData)}${this.typeIdentifier}number`;
                break;
            case 'object':
                data = `${JSON.stringify(plainData)}${this.typeIdentifier}object`;
                break;
        }
        const encrypted = cipher.update(data, 'utf8', 'hex');
        return [encrypted + cipher.final('hex'), Buffer.from(iv).toString('hex')].join('|');
    }
    decrypt(encryptedData) {
        const [encrypted, iv] = encryptedData.split('|');
        if (!iv)
            throw new Error('IV not found');
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'hex'));
        const result = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
        const [data, type] = result.split(this.typeIdentifier);
        switch (type) {
            case 'number':
                return Number(data);
            case 'object':
                return JSON.parse(data);
        }
        return data;
    }
}
exports.default = NodeCrypto;
