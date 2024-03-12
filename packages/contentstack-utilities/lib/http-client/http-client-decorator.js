"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientDecorator = void 0;
const base_client_decorator_1 = require("./base-client-decorator");
class HttpClientDecorator extends base_client_decorator_1.BaseClientDecorator {
    constructor(client) {
        super(client);
        this.client = client;
    }
    headers(headers) {
        return this.client.headers({
            authtoken: headers.auth_token,
            organization_uid: headers.org_uid,
        });
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
exports.HttpClientDecorator = HttpClientDecorator;
