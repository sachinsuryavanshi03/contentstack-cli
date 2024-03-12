"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const http_response_1 = require("./http-response");
const config_handler_1 = tslib_1.__importDefault(require("../config-handler"));
const auth_handler_1 = tslib_1.__importDefault(require("../auth-handler"));
class HttpClient {
    /**
     * Createa new pending HTTP request instance.
     */
    constructor(request = {}, options = {}) {
        /**
         * The payload format for a JSON or form-url-encoded request.
         */
        this.bodyFormat = 'json';
        this.request = request;
        this.axiosInstance = axios_1.default.create();
        this.disableEarlyAccessHeaders = options.disableEarlyAccessHeaders || false;
        // Sets payload format as json by default
        this.asJson();
    }
    /**
     * Create a reusable HttpClient instance.
     *
     * @returns {HttpClient}
     */
    static create(request = {}) {
        return new this(request);
    }
    /**
     * Returns the Axios request config.
     *
     * @returns {AxiosRequestConfig}
     */
    requestConfig() {
        return this.request;
    }
    /**
     * Resets the request config.
     *
     * @returns {AxiosRequestConfig}
     */
    resetConfig() {
        this.request = {};
        return this;
    }
    /**
     * Use the given `baseUrl` for all requests.
     *
     * @param {String} baseUrl
     *
     * @returns {HttpClient}
     */
    baseUrl(baseUrl) {
        if (typeof baseUrl !== 'string') {
            throw new Error(`The base URL must be a string. Received "${typeof baseUrl}"`);
        }
        this.request.baseURL = baseUrl;
        return this;
    }
    /**
     * Add request headers.
     * @returns {HttpClient}
     */
    headers(headers) {
        this.request.headers = Object.assign(Object.assign({}, this.request.headers), headers);
        return this;
    }
    /**
     * Add query parameters to the request.
     *
     * @param {Object} queryParams
     *
     * @returns {HttpClient}
     */
    queryParams(queryParams) {
        this.request.params = Object.assign(Object.assign({}, this.request.params), queryParams);
        return this;
    }
    /**
     * Add basic authentication via `username` and `password` to the request.
     *
     * @param {String} username
     * @param {String} password
     *
     * @returns {HttpClient}
     */
    basicAuth(username, password) {
        this.request.auth = { username, password };
        return this;
    }
    /**
     * Add an authorization `token` to the request.
     *
     * @param {String} token
     * @param {String} type
     *
     * @returns {HttpClient}
     */
    token(token, type = 'Bearer') {
        return this.headers({
            Authorization: `${type} ${token}`.trim(),
        });
    }
    /**
     * Merge your own custom Axios options into the request.
     *
     * @param {Object} options
     *
     * @returns {HttpClient}
     */
    options(options = {}) {
        Object.assign(this.request, options);
        return this;
    }
    /**
     * Add a request payload.
     *
     * @param {*} data
     *
     * @returns {HttpClient}
     */
    payload(data) {
        this.request.data = data;
        return this;
    }
    /**
     * Define the request `timeout` in milliseconds.
     *
     * @param {Number} timeout
     *
     * @returns {HttpClient}
     */
    timeout(timeout) {
        this.request.timeout = timeout;
        return this;
    }
    /**
     * Tell HttpClient to send the request as JSON payload.
     *
     * @returns {HttpClient}
     */
    asJson() {
        return this.payloadFormat('json').contentType('application/json');
    }
    /**
     * Tell HttpClient to send the request as form parameters,
     * encoded as URL query parameters.
     *
     * @returns {HttpClient}
     */
    asFormParams() {
        return this.payloadFormat('formParams').contentType('application/x-www-form-urlencoded');
    }
    /**
     * Set the request payload format.
     *
     * @param {String} format
     *
     * @returns {HttpClient}
     */
    payloadFormat(format) {
        this.bodyFormat = format;
        return this;
    }
    /**
     * Set the `Accept` request header. This indicates what
     * content type the server should return.
     *
     * @param {String} accept
     *
     * @returns {HttpClient}
     */
    accept(accept) {
        return this.headers({ Accept: accept });
    }
    /**
     * Set the `Accept` request header to JSON. This indicates
     * that the server should return JSON data.
     *
     * @param {String} accept
     *
     * @returns {HttpClient}
     */
    acceptJson() {
        return this.accept('application/json');
    }
    /**
     * Set the `Content-Type` request header.
     *
     * @param {String} contentType
     *
     * @returns {HttpClient}
     */
    contentType(contentType) {
        return this.headers({ 'Content-Type': contentType });
    }
    /**
     * Send an HTTP GET request, optionally with the given `queryParams`.
     *
     * @param {String} url
     * @param {Object} queryParams
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async get(url, queryParams = {}) {
        this.queryParams(queryParams);
        return this.send('GET', url);
    }
    /**
     * Send an HTTP POST request, optionally with the given `payload`.
     *
     * @param {String} url
     * @param {Object} payload
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async post(url, payload) {
        if (payload) {
            this.payload(payload);
        }
        return this.send('POST', url);
    }
    /**
     * Send an HTTP PUT request, optionally with the given `payload`.
     *
     * @param {String} url
     * @param {Object} payload
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async put(url, payload) {
        if (payload) {
            this.payload(payload);
        }
        return this.send('PUT', url);
    }
    /**
     * Send an HTTP PATCH request, optionally with the given `payload`.
     *
     * @param {String} url
     * @param {Object} payload
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async patch(url, payload) {
        if (payload) {
            this.payload(payload);
        }
        return this.send('PATCH', url);
    }
    /**
     * Send an HTTP DELETE request, optionally with the given `queryParams`.
     *
     * @param {String} url
     * @param {Object} queryParams
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async delete(url, queryParams = {}) {
        this.queryParams(queryParams);
        return this.send('DELETE', url);
    }
    /**
     * Send the HTTP request.
     *
     * @param {String} method
     * @param {String} url
     *
     * @returns {HttpResponse}
     *
     * @throws
     */
    async send(method, url) {
        try {
            return new http_response_1.HttpResponse(await this.createAndSendRequest(method, url));
        }
        catch (error) {
            if (error.response) {
                return new http_response_1.HttpResponse(error.response);
            }
            throw error;
        }
    }
    /**
     * Create and send the HTTP request.
     *
     * @param {String} method
     * @param {String} url
     *
     * @returns {Request}
     */
    async createAndSendRequest(method, url) {
        let counter = 0;
        this.axiosInstance.interceptors.response.use(null, async (error) => {
            var _a, _b;
            const { message, response } = error;
            if ((_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.error_message) === null || _b === void 0 ? void 0 : _b.includes('access token is invalid or expired')) {
                const token = await this.refreshToken();
                this.headers(Object.assign(Object.assign({}, this.request.headers), { authorization: token.authorization }));
                return await this.axiosInstance(Object.assign(Object.assign({ url,
                    method, withCredentials: true }, this.request), { data: this.prepareRequestPayload() }));
            }
            // Retry while Network timeout or Network Error
            if (!(message.includes('timeout') || message.includes('Network Error') || message.includes('getaddrinfo ENOTFOUND'))) {
                return Promise.reject(error);
            }
            if (counter < 1) {
                counter++;
                return await this.axiosInstance(Object.assign(Object.assign({ url,
                    method, withCredentials: true }, this.request), { data: this.prepareRequestPayload() }));
            }
            return Promise.reject(error);
        });
        if (!this.disableEarlyAccessHeaders) {
            // Add early access header by default
            const earlyAccessHeaders = config_handler_1.default.get(`earlyAccessHeaders`);
            if (earlyAccessHeaders && Object.keys(earlyAccessHeaders).length > 0) {
                this.headers({ 'x-header-ea': Object.values(earlyAccessHeaders).join(',') });
            }
        }
        return await this.axiosInstance(Object.assign(Object.assign({ url,
            method, withCredentials: true }, this.request), { data: this.prepareRequestPayload() }));
    }
    /**
     * Returns the request payload depending on the selected request payload format.
     */
    prepareRequestPayload() {
        return this.bodyFormat === 'formParams' ? new URLSearchParams(this.request.data).toString() : this.request.data;
    }
    async refreshToken() {
        const authorisationType = config_handler_1.default.get('authorisationType');
        if (authorisationType === 'BASIC') {
            return Promise.reject('Your session is timed out, please login to proceed');
        }
        else if (authorisationType === 'OAUTH') {
            return auth_handler_1.default
                .compareOAuthExpiry(true)
                .then(() => Promise.resolve({ authorization: `Bearer ${config_handler_1.default.get('oauthAccessToken')}` }))
                .catch((error) => Promise.reject(error));
        }
        else {
            return Promise.reject('You do not have permissions to perform this action, please login to proceed');
        }
    }
}
exports.HttpClient = HttpClient;
