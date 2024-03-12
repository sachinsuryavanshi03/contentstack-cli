"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileList = exports.getDirectories = void 0;
const tslib_1 = require("tslib");
const mkdirp_1 = tslib_1.__importDefault(require("mkdirp"));
const keys_1 = tslib_1.__importDefault(require("lodash/keys"));
const uuid_1 = require("uuid");
const isEmpty_1 = tslib_1.__importDefault(require("lodash/isEmpty"));
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const helper_1 = require("./helper");
class FsUtility {
    constructor(options = {}) {
        var _a;
        this.prefixKey = '';
        this.currentFileName = '';
        this.keepMetadata = false;
        this.metaData = {};
        this.readIndexer = {};
        this.writeIndexer = {};
        this.pageInfo = {
            after: 0,
            before: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            pageInfoUpdated: false,
        };
        const { fileExt, omitKeys, basePath, moduleName, metaHandler, keepMetadata, metaPickKeys, chunkFileSize, indexFileName, defaultInitContent, useIndexer = false, createDirIfNotExist = true, } = options;
        this.metaHandler = metaHandler;
        this.basePath = basePath || '';
        this.omitKeys = omitKeys || [];
        this.fileExt = fileExt || 'json';
        this.metaPickKeys = metaPickKeys || [];
        this.moduleName = moduleName || 'chunk';
        this.chunkFileSize = chunkFileSize || 10;
        this.keepMetadata = keepMetadata || ((_a = keepMetadata === undefined) !== null && _a !== void 0 ? _a : true);
        this.indexFileName = indexFileName || 'index.json';
        this.pageInfo.hasNextPage = (0, keys_1.default)(this.indexFileContent).length > 0;
        this.defaultInitContent = defaultInitContent || (this.fileExt === 'json' ? '{' : '');
        if (useIndexer) {
            this.writeIndexer = this.indexFileContent;
        }
        if (createDirIfNotExist) {
            this.createFolderIfNotExist(this.basePath);
        }
    }
    get isNewFsStructure() {
        return (0, node_fs_1.existsSync)(`${this.basePath}/metadata.json`) && (0, node_fs_1.existsSync)(`${this.basePath}/files`);
    }
    get isIndexFileExist() {
        return (0, node_fs_1.existsSync)(`${this.basePath}/${this.indexFileName}`);
    }
    get currentPageDetails() {
        return this.pageInfo;
    }
    get indexFileContent() {
        let indexData = {};
        const indexPath = `${this.basePath}/${this.indexFileName}`;
        if ((0, node_fs_1.existsSync)(indexPath)) {
            indexData = JSON.parse((0, node_fs_1.readFileSync)(indexPath, 'utf-8'));
        }
        return indexData;
    }
    /**
     * @method readChunkFiles
     * @returns Object
     */
    get readChunkFiles() {
        return {
            next: this.next.bind(this),
            previous: this.previous.bind(this),
            get: this.getFileByIndex.bind(this),
        };
    }
    // STUB old utility methods
    /**
     * @method readFile
     * @param filePath string
     * @param parse boolean | undefined
     * @returns string | undefined
     */
    readFile(filePath, parse = undefined) {
        let data;
        filePath = (0, node_path_1.resolve)(filePath);
        parse = typeof parse === 'undefined' ? true : parse;
        if ((0, node_fs_1.existsSync)(filePath)) {
            data = parse ? JSON.parse((0, node_fs_1.readFileSync)(filePath, 'utf-8')) : data;
        }
        return data;
    }
    /**
     * @method writeFile
     * @param filePath string
     * @param data Object | undefined
     * @return void
     */
    writeFile(filePath, data, mapKeyVal = false) {
        if (mapKeyVal) {
            data = (0, helper_1.mapKeyAndVal)(data, 'uid', this.omitKeys); // NOTE Map values as Key/value pair object
        }
        data = typeof data === 'object' ? JSON.stringify(data) : data || '{}';
        (0, node_fs_1.writeFileSync)(filePath, data);
    }
    /**
     * @method makeDirectory
     * @param path string
     * @return Promise<string | undefined>
     */
    makeDirectory(path) {
        return (0, mkdirp_1.default)(path);
    }
    /**
     * @method readdir
     * @param dirPath string | Buffer | URL
     * @returns [string]
     */
    readdir(dirPath) {
        return (0, node_fs_1.existsSync)(dirPath) ? (0, node_fs_1.readdirSync)(dirPath) : [];
    }
    // STUB End of old utility
    /**
     * @method createFolderIfNotExist
     * @param path string
     * @return {void}
     */
    createFolderIfNotExist(path) {
        if (path && !(0, node_fs_1.existsSync)(path)) {
            (0, node_fs_1.mkdirSync)(path, { recursive: true });
        }
    }
    /**
     * @method writeIntoFile
     * @param {String|Object|Array} chunk Record<string, string>[]
     * @param {WriteFileOptions} options WriteFileOptions
     * @return void
     */
    writeIntoFile(chunk, options) {
        if (!this.writableStream) {
            this.createNewFile();
        }
        this.writeIntoExistingFile(chunk, options);
    }
    /**
     * @method createNewFile
     * @return {void}
     * @description creating new chunk file
     */
    createNewFile() {
        const fileName = `${(0, uuid_1.v4)()}-${this.moduleName || 'chunk'}.${this.fileExt}`;
        this.currentFileName = fileName;
        this.writeIndexer[(0, keys_1.default)(this.writeIndexer).length + 1] = fileName;
        this.currentFileRelativePath = `${this.basePath}/${fileName}`;
        (0, node_fs_1.writeFileSync)(this.currentFileRelativePath, this.defaultInitContent);
        this.writableStream = (0, node_fs_1.createWriteStream)(this.currentFileRelativePath, {
            flags: 'a',
        });
    }
    /**
     * @method writeIntoExistingFile
     * @param chunk Record<string, string>[] | object | Array<any> | string;
     * @param options WriteFileOptions
     * @returns void
     */
    writeIntoExistingFile(chunk, options) {
        var _a;
        let fileContent = chunk;
        let fileSizeReachedLimit = false;
        const { keyName, mapKeyVal } = options || {
            keyName: 'uid',
            mapKeyVal: false,
        };
        if (mapKeyVal) {
            fileContent = this.handleKeyValMapAndMetaData(chunk, keyName); // NOTE Map values as Key/value pair object
        }
        if (typeof fileContent === 'object') {
            fileContent = JSON.stringify(fileContent).slice(1, -1);
        }
        const { size } = (0, node_fs_1.statSync)(this.currentFileRelativePath);
        if ((options === null || options === void 0 ? void 0 : options.closeFile) === true || size / (1024 * 1024) >= this.chunkFileSize) {
            // NOTE Each chunk file size Ex. 5 (MB)
            fileSizeReachedLimit = true;
        }
        const suffix = fileSizeReachedLimit ? '}' : '';
        fileContent = this.fileExt === 'json' ? `${this.prefixKey}${fileContent}${suffix}` : fileContent;
        (_a = this.writableStream) === null || _a === void 0 ? void 0 : _a.write(fileContent);
        if (!this.prefixKey)
            this.prefixKey = ',';
        if (fileSizeReachedLimit) {
            this.closeFile((options === null || options === void 0 ? void 0 : options.closeFile) === true);
        }
    }
    /**
     * @method handleKeyValMapAndMetaData
     * @param chunk Chunk
     * @param keyName string
     * @returns Chunk
     */
    handleKeyValMapAndMetaData(chunk, keyName) {
        const fileContent = (0, helper_1.mapKeyAndVal)(chunk, keyName || 'uid', this.omitKeys); // NOTE Map values as Key/value pair object
        // NOTE update metadata
        if (this.keepMetadata) {
            const metadata = (0, helper_1.getMetaData)(chunk, this.metaPickKeys, this.metaHandler);
            if (metadata && !(0, isEmpty_1.default)(metadata)) {
                if ((0, isEmpty_1.default)(this.metaData[this.currentFileName]))
                    this.metaData[this.currentFileName] = [];
                this.metaData[this.currentFileName].push(...metadata);
            }
        }
        return fileContent;
    }
    /**
     * @method completeFile
     * @param closeIndexer boolean
     * @return {void}
     * @description writing chunks into existing file
     */
    completeFile(closeIndexer) {
        if (this.writableStream) {
            if (this.fileExt === 'json') {
                this.writableStream.write('}');
            }
        }
        this.closeFile(closeIndexer);
    }
    /**
     * @method closeFile
     * @param closeIndexer boolean
     * @return {void}
     * @description closing current write stream
     */
    closeFile(closeIndexer = true) {
        if (closeIndexer) {
            // NOTE write file index details into a file
            (0, node_fs_1.writeFileSync)(`${this.basePath}/${this.indexFileName}`, JSON.stringify(this.writeIndexer));
            // NOTE write metadata into a file
            if (this.keepMetadata) {
                (0, node_fs_1.writeFileSync)(`${this.basePath}/metadata.json`, JSON.stringify(this.metaData));
            }
        }
        if (this.writableStream instanceof node_fs_1.WriteStream) {
            this.writableStream.end();
            this.prefixKey = '';
            this.writableStream = null;
        }
    }
    saveMeta(meta) {
        (0, node_fs_1.writeFileSync)(`${this.basePath}/metadata.json`, JSON.stringify(meta));
    }
    getPlainMeta(basePath) {
        const path = basePath || (0, node_path_1.resolve)(this.basePath, 'metadata.json');
        if (!(0, node_fs_1.existsSync)(path))
            return {};
        return JSON.parse((0, node_fs_1.readFileSync)(path, { encoding: 'utf-8' }));
    }
    /**
     * @method getFileByIndex
     * @param _self FsUtility
     * @param index number
     * @returns Promise<string>
     */
    getFileByIndex(index = 1) {
        return new Promise((resolve, reject) => {
            if (index <= 0) {
                reject(new Error('Invalid index'));
                return;
            }
            this.updatePageInfo(null, index);
            if ((0, isEmpty_1.default)(this.readIndexer[index])) {
                reject(new Error('File not found!'));
                return;
            }
            const fileContent = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(this.basePath, this.readIndexer[index]), {
                encoding: 'utf-8',
            });
            resolve(this.fileExt === 'json' ? JSON.parse(fileContent) : fileContent);
        });
    }
    /**
     * @method next
     * @returns Promise<string>
     */
    next() {
        return new Promise((resolve, reject) => {
            this.updatePageInfo(true);
            if ((0, isEmpty_1.default)(this.readIndexer[this.pageInfo.after])) {
                reject(new Error('File not found!'));
                return;
            }
            const fileContent = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(this.basePath, this.readIndexer[this.pageInfo.after]), {
                encoding: 'utf-8',
            });
            resolve(this.fileExt === 'json' ? JSON.parse(fileContent) : fileContent);
        });
    }
    /**
     * @method previous
     * @param _self FsUtility
     * @returns Promise<string>
     */
    previous() {
        return new Promise((resolve, reject) => {
            this.updatePageInfo(false);
            if ((0, isEmpty_1.default)(this.readIndexer[this.pageInfo.before])) {
                reject(new Error('File not found'));
                return;
            }
            const fileContent = (0, node_fs_1.readFileSync)((0, node_path_1.resolve)(this.basePath, this.readIndexer[this.pageInfo.before]), {
                encoding: 'utf-8',
            });
            resolve(this.fileExt === 'json' ? JSON.parse(fileContent) : fileContent);
        });
    }
    /**
     * @method updatePageInfo
     * @param _self FsUtility
     * @param isNext boolean
     * @param index number
     * @returns void
     */
    updatePageInfo(isNext = true, index = null) {
        if (!this.pageInfo.pageInfoUpdated) {
            this.readIndexer = this.indexFileContent;
            this.pageInfo.pageInfoUpdated = true;
        }
        const { after, before } = this.pageInfo;
        if (isNext === true) {
            this.pageInfo.before = 1;
            this.pageInfo.after = after + 1;
        }
        else if (isNext === false) {
            this.pageInfo.after = 0;
            this.pageInfo.before = before - 1;
        }
        else {
            this.pageInfo.after = index || 0;
            this.pageInfo.before = 1;
        }
        /* eslint-disable unicorn/consistent-destructuring */
        if (!(0, isEmpty_1.default)(this.readIndexer[this.pageInfo.after + 1])) {
            this.pageInfo.hasNextPage = true;
        }
        /* eslint-disable unicorn/consistent-destructuring */
        if (!(0, isEmpty_1.default)(this.readIndexer[this.pageInfo.after - 1])) {
            this.pageInfo.hasPreviousPage = true;
        }
    }
    removeFile(path) {
        if ((0, node_fs_1.existsSync)(path))
            (0, node_fs_1.unlinkSync)(path);
    }
}
exports.default = FsUtility;
function getDirectories(source) {
    if (!(0, node_fs_1.existsSync)(source))
        return [];
    return (0, node_fs_1.readdirSync)(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
}
exports.getDirectories = getDirectories;
async function getFileList(dirName, onlyName = true) {
    if (!(0, node_fs_1.existsSync)(dirName))
        return [];
    let files = [];
    const items = (0, node_fs_1.readdirSync)(dirName, { withFileTypes: true });
    for (const item of items) {
        if (item.isDirectory()) {
            /* eslint-disable no-await-in-loop */
            files = [...files, ...(await getFileList(`${dirName}/${item.name}`))];
        }
        else {
            files.push(onlyName ? item.name : `${dirName}/${item.name}`);
        }
    }
    return files;
}
exports.getFileList = getFileList;
