"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managementSDKInitiator = void 0;
const tslib_1 = require("tslib");
const management_1 = require("@contentstack/management");
const auth_handler_1 = tslib_1.__importDefault(require("./auth-handler"));
const node_https_1 = require("node:https");
const config_handler_1 = tslib_1.__importDefault(require("./config-handler"));
class ManagementSDKInitiator {
    constructor() { }
    init(context) {
        this.analyticsInfo = context === null || context === void 0 ? void 0 : context.analyticsInfo;
    }
    async createAPIClient(config) {
        const option = {
            host: config.host,
            maxContentLength: 100000000,
            maxBodyLength: 1000000000,
            maxRequests: 10,
            retryLimit: 3,
            timeout: 60000,
            httpsAgent: new node_https_1.Agent({
                maxSockets: 100,
                maxFreeSockets: 10,
                keepAlive: true,
                timeout: 60000, // active socket keepalive for 60 seconds
                // NOTE freeSocketTimeout option not exist in https client
                // freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
            }),
            retryDelay: Math.floor(Math.random() * (8000 - 3000 + 1) + 3000),
            logHandler: (level, data) => { },
            retryCondition: (error) => {
                // LINK https://github.com/contentstack/contentstack-javascript/blob/72fee8ad75ba7d1d5bab8489ebbbbbbaefb1c880/src/core/stack.js#L49
                if (error.response && error.response.status) {
                    switch (error.response.status) {
                        case 401:
                        case 429:
                        case 408:
                            return true;
                        default:
                            return false;
                    }
                }
            },
            retryDelayOptions: {
                base: 1000,
                customBackoff: (retryCount, error) => {
                    return 1;
                },
            },
            refreshToken: () => {
                return new Promise((resolve, reject) => {
                    const authorisationType = config_handler_1.default.get('authorisationType');
                    if (authorisationType === 'BASIC') {
                        // Handle basic auth 401 here
                        reject('Session timed out, please login to proceed');
                    }
                    else if (authorisationType === 'OAUTH') {
                        return auth_handler_1.default
                            .compareOAuthExpiry(true)
                            .then(() => {
                            resolve({
                                authorization: `Bearer ${config_handler_1.default.get('oauthAccessToken')}`,
                            });
                        })
                            .catch((error) => {
                            reject(error);
                        });
                    }
                    else {
                        reject('You do not have permissions to perform this action, please login to proceed');
                    }
                });
            },
        };
        if (config.endpoint) {
            option.endpoint = config.endpoint;
        }
        if (typeof config.branchName === 'string') {
            if (!option.headers)
                option.headers = {};
            option.headers.branch = config.branchName;
        }
        if (this.analyticsInfo) {
            if (!option.headers)
                option.headers = {};
            option.headers['X-CS-CLI'] = this.analyticsInfo;
        }
        if (!config.management_token) {
            const authorisationType = config_handler_1.default.get('authorisationType');
            if (authorisationType === 'BASIC') {
                option.authtoken = config_handler_1.default.get('authtoken');
                option.authorization = '';
            }
            else if (authorisationType === 'OAUTH') {
                if (!config.skipTokenValidity) {
                    await auth_handler_1.default.compareOAuthExpiry();
                    option.authorization = `Bearer ${config_handler_1.default.get('oauthAccessToken')}`;
                }
                else {
                    option.authtoken = '';
                    option.authorization = '';
                }
            }
            else {
                option.authtoken = '';
                option.authorization = '';
            }
        }
        const earlyAccessHeaders = config_handler_1.default.get(`earlyAccessHeaders`);
        if (earlyAccessHeaders && Object.keys(earlyAccessHeaders).length > 0) {
            option.early_access = Object.values(earlyAccessHeaders);
        }
        return (0, management_1.client)(option);
    }
}
exports.managementSDKInitiator = new ManagementSDKInitiator();
exports.default = exports.managementSDKInitiator.createAPIClient.bind(exports.managementSDKInitiator);
