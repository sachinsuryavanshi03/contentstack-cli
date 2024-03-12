"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthDecorator = void 0;
const tslib_1 = require("tslib");
const base_client_decorator_1 = require("./base-client-decorator");
const config_handler_1 = tslib_1.__importDefault(require("../config-handler"));
const auth_handler_1 = tslib_1.__importDefault(require("../auth-handler"));
class OauthDecorator extends base_client_decorator_1.BaseClientDecorator {
    constructor(client) {
        super(client);
        this.client = client;
    }
    async preHeadersCheck(config) {
        const headers = {};
        headers.organization_uid = config.org_uid;
        const authorisationType = config_handler_1.default.get('authorisationType');
        if (authorisationType === 'BASIC') {
            headers.authtoken = config_handler_1.default.get('authtoken');
        }
        else if (authorisationType === 'OAUTH') {
            await auth_handler_1.default.compareOAuthExpiry();
            headers.authorization = `Bearer ${config_handler_1.default.get('oauthAccessToken')}`;
        }
        else {
            headers.authtoken = '';
            headers.authorization = '';
        }
        return headers;
    }
    headers(headers) {
        return this.client.headers(headers);
    }
    contentType(contentType) {
        return this.client.contentType(contentType);
    }
    get(url, queryParams) {
        return this.client.get(url, queryParams);
    }
    post(url, payload) {
        return this.client.post(url, payload);
    }
    put(url, payload) {
        return this.client.put(url, payload);
    }
    delete(url, queryParams) {
        return this.client.delete(url, queryParams);
    }
}
exports.OauthDecorator = OauthDecorator;
