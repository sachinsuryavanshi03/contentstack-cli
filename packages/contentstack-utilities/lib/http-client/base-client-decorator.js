"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseClientDecorator = void 0;
class BaseClientDecorator {
    constructor(client) {
        this.client = client;
    }
    headers(headers) {
        return this.client.headers(headers);
    }
    contentType(contentType) {
        return this.client.contentType(contentType);
    }
    get(url, queryParams = {}) {
        return this.client.get(url, queryParams);
    }
    post(url, payload) {
        return this.client.post(url, payload);
    }
    put(url, payload) {
        return this.client.put(url, payload);
    }
    delete(url, queryParams = {}) {
        return this.client.delete(url, queryParams);
    }
}
exports.BaseClientDecorator = BaseClientDecorator;
