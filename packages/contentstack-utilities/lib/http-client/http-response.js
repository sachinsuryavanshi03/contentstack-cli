'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponse = void 0;
class HttpResponse {
    /**
     * Wrap the given Axios `response` into a new response instance.
     *
     * @param {AxiosResponse} response
     */
    constructor(response) {
        this.response = response;
    }
    /**
     * Returns the response status.
     *
     * @returns {Number}
     */
    get status() {
        return this.response.status;
    }
    /**
     * Returns the response payload. This method is an alias for `response.payload()`.
     *
     * @returns {*}
     */
    get data() {
        return this.payload;
    }
    /**
     * Returns the response payload.
     *
     * @returns {*}
     */
    get payload() {
        return this.response.data;
    }
    /**
     * Returns the response headers.
     *
     * @returns {Object}
     */
    get headers() {
        return this.response.headers;
    }
}
exports.HttpResponse = HttpResponse;
