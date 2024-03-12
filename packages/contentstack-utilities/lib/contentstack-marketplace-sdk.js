"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceSDKInitiator = exports.marketplaceSDKInitiator = void 0;
const tslib_1 = require("tslib");
const node_https_1 = require("node:https");
const marketplace_sdk_1 = require("@contentstack/marketplace-sdk");
const auth_handler_1 = tslib_1.__importDefault(require("./auth-handler"));
const config_handler_1 = tslib_1.__importDefault(require("./config-handler"));
class MarketplaceSDKInitiator {
    /**
     * The function returns a default configuration object for Contentstack API requests in TypeScript.
     * @returns a default configuration object of type `ContentstackConfig`.
     */
    get defaultOptions() {
        return {
            headers: {},
            retryLimit: 3,
            timeout: 60000,
            maxRequests: 10,
            authtoken: '',
            authorization: '',
            // host: 'api.contentstack.io',
            maxContentLength: 100000000,
            maxBodyLength: 1000000000,
            httpsAgent: new node_https_1.Agent({
                timeout: 60000,
                maxSockets: 100,
                keepAlive: true,
                maxFreeSockets: 10,
            }),
            retryDelay: Math.floor(Math.random() * (8000 - 3000 + 1) + 3000),
            retryCondition: (error) => {
                var _a;
                if ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) {
                    if ([408].includes(error.response.status)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            },
            retryDelayOptions: {
                base: 1000,
                customBackoff: () => 1,
            },
        };
    }
    init(context) {
        this.analyticsInfo = context === null || context === void 0 ? void 0 : context.analyticsInfo;
    }
    /**
     * The function `refreshTokenHandler` returns a promise that resolves with a `ContentstackToken`
     * object based on the `authorizationType` parameter.
     * @param {string} authorizationType - The `authorizationType` parameter is a string that specifies
     * the type of authorization being used. It can have one of the following values:
     * @returns The refreshTokenHandler function returns a function that returns a Promise of type
     * ContentstackToken.
     */
    refreshTokenHandler(authorizationType) {
        return () => {
            return new Promise((resolve, reject) => {
                if (authorizationType === 'BASIC') {
                    // NOTE Handle basic auth 401 here
                    reject(new Error('Session timed out, please login to proceed'));
                }
                else if (authorizationType === 'OAUTH') {
                    auth_handler_1.default
                        .compareOAuthExpiry(true)
                        .then(() => resolve({ authorization: `Bearer ${config_handler_1.default.get('oauthAccessToken')}` }))
                        .catch(reject);
                }
                else {
                    reject(new Error('You do not have permissions to perform this action, please login to proceed'));
                }
            });
        };
    }
    /**
     * The function creates a Contentstack SDK client with the provided configuration.
     * @param config - The `config` parameter is an object that contains the following properties:
     * @returns a Promise that resolves to a ContentstackClient object.
     */
    async createAppSDKClient(config) {
        const authorizationType = config_handler_1.default.get('authorisationType');
        const option = this.defaultOptions;
        option.refreshToken = this.refreshTokenHandler(authorizationType);
        if (config.host) {
            option.host = config.host;
        }
        if (config.endpoint) {
            option.endpoint = config.endpoint;
        }
        if (config.retryLimit) {
            option.retryLimit = config.retryLimit;
        }
        if (config.retryDelay) {
            option.retryDelay = config.retryDelay;
        }
        if (this.analyticsInfo) {
            option.headers['X-CS-CLI'] = this.analyticsInfo;
        }
        if (authorizationType === 'BASIC') {
            option.authtoken = config_handler_1.default.get('authtoken');
        }
        else if (authorizationType === 'OAUTH') {
            if (!config.skipTokenValidity) {
                await auth_handler_1.default.compareOAuthExpiry();
                option.authorization = `Bearer ${config_handler_1.default.get('oauthAccessToken')}`;
            }
        }
        return (0, marketplace_sdk_1.client)(option);
    }
}
exports.MarketplaceSDKInitiator = MarketplaceSDKInitiator;
exports.marketplaceSDKInitiator = new MarketplaceSDKInitiator();
const marketplaceSDKClient = exports.marketplaceSDKInitiator.createAppSDKClient.bind(exports.marketplaceSDKInitiator);
exports.default = marketplaceSDKClient;
