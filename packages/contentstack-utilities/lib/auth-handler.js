"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cli_ux_1 = tslib_1.__importDefault(require("./cli-ux"));
const http_client_1 = tslib_1.__importDefault(require("./http-client"));
const config_handler_1 = tslib_1.__importDefault(require("./config-handler"));
const ContentstackManagementSDK = tslib_1.__importStar(require("@contentstack/management"));
const message_handler_1 = tslib_1.__importDefault(require("./message-handler"));
const http = require('http');
const url = require('url');
const open_1 = tslib_1.__importDefault(require("open"));
const logger_1 = require("./logger");
const crypto = require('crypto');
/**
 * @class
 * Auth handler
 */
class AuthHandler {
    set host(contentStackHost) {
        this._host = contentStackHost;
    }
    constructor() {
        this.checkExpiryAndRefresh = (force = false) => this.compareOAuthExpiry(force);
        this.codeVerifier = crypto.pseudoRandomBytes(32).toString('hex');
        this.OAuthAppId = process.env.OAUTH_APP_ID || '6400aa06db64de001a31c8a9';
        this.OAuthClientId = process.env.OAUTH_CLIENT_ID || 'Ie0FEfTzlfAHL4xM';
        this.OAuthRedirectURL = process.env.OAUTH_APP_REDIRECT_URL || 'http://localhost:8184';
        this.OAuthScope = '';
        this.OAuthResponseType = 'code';
        this.authTokenKeyName = 'authtoken';
        this.authEmailKeyName = 'email';
        this.oauthAccessTokenKeyName = 'oauthAccessToken';
        this.oauthDateTimeKeyName = 'oauthDateTime';
        this.oauthUserUidKeyName = 'userUid';
        this.oauthOrgUidKeyName = 'oauthOrgUid';
        this.oauthRefreshTokenKeyName = 'oauthRefreshToken';
        this.authorisationTypeKeyName = 'authorisationType';
        this.authorisationTypeOAUTHValue = 'OAUTH';
        this.authorisationTypeAUTHValue = 'BASIC';
        this.allAuthConfigItems = {
            refreshToken: [
                this.authTokenKeyName,
                this.oauthAccessTokenKeyName,
                this.oauthDateTimeKeyName,
                this.oauthRefreshTokenKeyName,
            ],
            default: [
                this.authTokenKeyName,
                this.authEmailKeyName,
                this.oauthAccessTokenKeyName,
                this.oauthDateTimeKeyName,
                this.oauthUserUidKeyName,
                this.oauthOrgUidKeyName,
                this.oauthRefreshTokenKeyName,
                this.authorisationTypeKeyName,
            ],
        };
    }
    initLog() {
        this.logger = new logger_1.LoggerService(process.cwd(), 'cli-log');
    }
    async setOAuthBaseURL() {
        if (config_handler_1.default.get('region')['uiHost']) {
            this.OAuthBaseURL = config_handler_1.default.get('region')['uiHost'] || '';
        }
        else {
            throw new Error('Invalid ui-host URL while authenticating. Please set your region correctly using the command - csdx config:set:region');
        }
    }
    /*
     *
     * Login into Contentstack
     * @returns {Promise} Promise object returns {} on success
     */
    async oauth() {
        return new Promise((resolve, reject) => {
            this.initLog();
            this.createHTTPServer()
                .then(() => {
                this.openOAuthURL()
                    .then(() => {
                    //set timeout for authorization
                    resolve({});
                })
                    .catch((error) => {
                    this.logger.error('OAuth login failed', error.message);
                    reject(error);
                });
            })
                .catch((error) => {
                this.logger.error('OAuth login failed', error.message);
                reject(error);
            });
        });
    }
    async createHTTPServer() {
        return new Promise((resolve, reject) => {
            try {
                const server = http.createServer((req, res) => {
                    const reqURL = req.url;
                    const queryObject = url.parse(reqURL, true).query;
                    if (queryObject.code) {
                        cli_ux_1.default.print('Auth code successfully fetched.');
                        this.getAccessToken(queryObject.code)
                            .then(async () => {
                            await this.setOAuthBaseURL();
                            cli_ux_1.default.print('Access token fetched using auth code successfully.');
                            cli_ux_1.default.print(`You can review the access permissions on the page - ${this.OAuthBaseURL}/#!/marketplace/authorized-apps`);
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`<style>
                body {
                  font-family: Arial, sans-serif;
                  text-align: center;
                  margin-top: 100px;
                }
              
                p {
                  color: #475161;
                  margin-bottom: 20px;
                }
                p button {
                  background-color: #6c5ce7;
                  color: #fff;
                  border: 1px solid transparent;
                  border-radius: 4px;
                  font-weight: 600;
                  line-height: 100%;
                  text-align: center;
                  min-height: 2rem;
                  padding: 0.3125rem 1rem;
                }
              </style>
              <h1 style="color: #6c5ce7">Successfully authorized!</h1>
              <p style="color: #475161; font-size: 16px; font-weight: 600">You can close this window now.</p>
              <p>
                You can review the access permissions on the
                <a
                  style="color: #6c5ce7; text-decoration: none"
                  href="${this.OAuthBaseURL}/#!/marketplace/authorized-apps"
                  target="_blank"
                  >Authorized Apps page</a
                >.
              </p>`);
                            stopServer();
                        })
                            .catch((error) => {
                            cli_ux_1.default.error('Error occoured while login with OAuth, please login with command - csdx auth:login --oauth');
                            cli_ux_1.default.error(error);
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`<h1>Sorry!</h1><h2>Something went wrong, please login with command - csdx auth:login --oauth(</h2>`);
                            stopServer();
                        });
                    }
                    else {
                        cli_ux_1.default.error('Error occoured while login with OAuth, please login with command - csdx auth:login --oauth');
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`<h1>Sorry!</h1><h2>Something went wrong, please login with command - csdx auth:login --oauth(</h2>`);
                        stopServer();
                    }
                });
                const stopServer = () => {
                    server.close();
                    process.exit();
                };
                server.listen(8184, () => {
                    cli_ux_1.default.print('Waiting for the authorization server to respond...');
                    resolve({ true: true });
                });
            }
            catch (error) {
                cli_ux_1.default.error(error);
                reject(error);
            }
        });
    }
    async openOAuthURL() {
        return new Promise(async (resolve, reject) => {
            try {
                const digest = crypto.createHash('sha256').update(this.codeVerifier).digest();
                const codeChallenge = digest.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                await this.setOAuthBaseURL();
                let url = `${this.OAuthBaseURL}/#!/apps/${this.OAuthAppId}/authorize?response_type=${this.OAuthResponseType}&client_id=${this.OAuthClientId}&redirect_uri=${this.OAuthRedirectURL}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
                if (this.OAuthScope) {
                    url += `&scope=${encodeURIComponent(this.OAuthScope)}`;
                }
                cli_ux_1.default.print('This will automatically start the browser and open the below URL, if it does not, you can copy and paste the below URL in the browser without terminating this command.', { color: 'yellow' });
                cli_ux_1.default.print(url, { color: 'green' });
                resolve((0, open_1.default)(url));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async getAccessToken(code) {
        return new Promise((resolve, reject) => {
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const payload = {
                grant_type: 'authorization_code',
                client_id: this.OAuthClientId,
                code_verifier: this.codeVerifier,
                redirect_uri: this.OAuthRedirectURL,
                code: code,
            };
            this.setOAuthBaseURL();
            const httpClient = new http_client_1.default().headers(headers).asFormParams();
            httpClient
                .post(`${this.OAuthBaseURL}/apps-api/apps/token`, payload)
                .then(({ data }) => {
                return this.getUserDetails(data);
            })
                .then((data) => {
                if (data['access_token'] && data['refresh_token']) {
                    return this.setConfigData('oauth', data);
                }
                else {
                    reject('Invalid request');
                }
            })
                .then(resolve)
                .catch((error) => {
                cli_ux_1.default.error('An error occoured while fetching the access token, run the command - csdx auth:login --oauth');
                cli_ux_1.default.error(error);
                reject(error);
            });
        });
    }
    async setConfigData(type, userData = {}) {
        return new Promise(async (resolve, reject) => {
            //Delete the old configstore auth data
            this.unsetConfigData(type)
                .then(() => {
                switch (type) {
                    case 'oauth':
                        if (userData.access_token && userData.refresh_token) {
                            //Set the new OAuth tokens info
                            config_handler_1.default.set(this.oauthAccessTokenKeyName, userData.access_token);
                            config_handler_1.default.set(this.oauthRefreshTokenKeyName, userData.refresh_token);
                            config_handler_1.default.set(this.authEmailKeyName, userData.email);
                            config_handler_1.default.set(this.oauthDateTimeKeyName, new Date());
                            config_handler_1.default.set(this.oauthUserUidKeyName, userData.user_uid);
                            config_handler_1.default.set(this.oauthOrgUidKeyName, userData.organization_uid);
                            config_handler_1.default.set(this.authorisationTypeKeyName, this.authorisationTypeOAUTHValue);
                            resolve(userData);
                        }
                        else {
                            reject('Invalid request');
                        }
                        break;
                    case 'refreshToken':
                        if (userData.access_token && userData.refresh_token) {
                            //Set the new OAuth tokens info
                            config_handler_1.default.set(this.oauthAccessTokenKeyName, userData.access_token);
                            config_handler_1.default.set(this.oauthRefreshTokenKeyName, userData.refresh_token);
                            config_handler_1.default.set(this.oauthDateTimeKeyName, new Date());
                            resolve(userData);
                        }
                        else {
                            reject('Invalid request');
                        }
                        break;
                    case 'basicAuth':
                        if (userData.authtoken && userData.email) {
                            //Set the new auth tokens info
                            config_handler_1.default.set(this.authTokenKeyName, userData.authtoken);
                            config_handler_1.default.set(this.authEmailKeyName, userData.email);
                            config_handler_1.default.set(this.authorisationTypeKeyName, this.authorisationTypeAUTHValue);
                            resolve(userData);
                        }
                        else {
                            reject('Invalid request');
                        }
                        break;
                    case 'logout':
                        resolve(userData);
                        break;
                    default:
                        reject('Invalid request');
                        break;
                }
            })
                .catch((error) => {
                reject(error);
            });
        });
    }
    async unsetConfigData(type = 'default') {
        return new Promise(async (resolve, reject) => {
            //Delete the old auth tokens info
            let removeItems = this.allAuthConfigItems.default;
            if (type === 'refreshToken') {
                removeItems = this.allAuthConfigItems.refreshToken;
            }
            removeItems.forEach((element) => {
                config_handler_1.default.delete(element);
            });
            resolve();
        });
    }
    async refreshToken() {
        return new Promise((resolve, reject) => {
            const configOauthRefreshToken = config_handler_1.default.get(this.oauthRefreshTokenKeyName);
            const configAuthorisationType = config_handler_1.default.get(this.authorisationTypeKeyName);
            if (configAuthorisationType === this.authorisationTypeOAUTHValue && configOauthRefreshToken) {
                const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
                const payload = {
                    grant_type: 'refresh_token',
                    client_id: this.OAuthClientId,
                    redirect_uri: this.OAuthRedirectURL,
                    refresh_token: configOauthRefreshToken,
                };
                this.setOAuthBaseURL();
                const httpClient = new http_client_1.default().headers(headers).asFormParams();
                httpClient
                    .post(`${this.OAuthBaseURL}/apps-api/apps/token`, payload)
                    .then(({ data }) => {
                    if (data.error || (data.statusCode != 200 && data.message)) {
                        let errorMessage = '';
                        if (data.message) {
                            if (data.message[0]) {
                                errorMessage = data.message[0];
                            }
                            else {
                                errorMessage = data.message;
                            }
                        }
                        else {
                            errorMessage = data.error;
                        }
                        reject(errorMessage);
                    }
                    else {
                        if (data['access_token'] && data['refresh_token']) {
                            return this.setConfigData('refreshToken', data);
                        }
                        else {
                            reject('Invalid request');
                        }
                    }
                })
                    .then(resolve)
                    .catch((error) => {
                    cli_ux_1.default.error('An error occoured while refreshing the token');
                    cli_ux_1.default.error(error);
                    reject(error);
                });
            }
            else {
                cli_ux_1.default.error('Invalid/Empty refresh token, run the command- csdx auth:login --oauth');
                reject('Invalid/Empty refresh token');
            }
        });
    }
    async getUserDetails(data) {
        return new Promise((resolve, reject) => {
            const accessToken = data.access_token;
            if (accessToken) {
                const param = {
                    host: this._host,
                    authorization: `Bearer ${accessToken}`,
                };
                const managementAPIClient = ContentstackManagementSDK.client(param);
                managementAPIClient
                    .getUser()
                    .then((user) => {
                    data.email = (user === null || user === void 0 ? void 0 : user.email) || '';
                    resolve(data);
                })
                    .catch((error) => {
                    reject(error);
                });
            }
            else {
                cli_ux_1.default.error('Invalid/Empty access token, run the command - csdx auth:login --oauth');
                reject('Invalid/Empty access token');
            }
        });
    }
    async oauthLogout() {
        const authorization = await this.getOauthAppAuthorization() || "";
        const response = await this.revokeOauthAppAuthorization(authorization);
        return response || {};
    }
    /**
     * Fetches all authorizations for the Oauth App, returns authorizationUid for current user.
     * @returns authorizationUid for the current user
     */
    async getOauthAppAuthorization() {
        const headers = {
            authorization: `Bearer ${config_handler_1.default.get(this.oauthAccessTokenKeyName)}`,
            organization_uid: config_handler_1.default.get(this.oauthOrgUidKeyName),
            'Content-type': 'application/json'
        };
        const httpClient = new http_client_1.default().headers(headers);
        await this.setOAuthBaseURL();
        return httpClient
            .get(`${this.OAuthBaseURL}/apps-api/manifests/${this.OAuthAppId}/authorizations`)
            .then(({ data }) => {
            var _a, _b;
            if (((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const userUid = config_handler_1.default.get(this.oauthUserUidKeyName);
                const currentUserAuthorization = ((_b = data === null || data === void 0 ? void 0 : data.data) === null || _b === void 0 ? void 0 : _b.filter(element => element.user.uid === userUid)) || [];
                if (currentUserAuthorization.length === 0) {
                    throw new Error(message_handler_1.default.parse("CLI_AUTH_LOGOUT_NO_AUTHORIZATIONS_USER"));
                }
                return currentUserAuthorization[0].authorization_uid; // filter authorizations by current logged in user
            }
            else {
                throw new Error(message_handler_1.default.parse("CLI_AUTH_LOGOUT_NO_AUTHORIZATIONS"));
            }
        });
    }
    async revokeOauthAppAuthorization(authorizationId) {
        if (authorizationId.length > 1) {
            const headers = {
                authorization: `Bearer ${config_handler_1.default.get(this.oauthAccessTokenKeyName)}`,
                organization_uid: config_handler_1.default.get(this.oauthOrgUidKeyName),
                'Content-type': 'application/json'
            };
            const httpClient = new http_client_1.default().headers(headers);
            await this.setOAuthBaseURL();
            return httpClient
                .delete(`${this.OAuthBaseURL}/apps-api/manifests/${this.OAuthAppId}/authorizations/${authorizationId}`)
                .then(({ data }) => {
                return data;
            });
        }
    }
    isAuthenticated() {
        const authorizationType = config_handler_1.default.get(this.authorisationTypeKeyName);
        return (authorizationType === this.authorisationTypeOAUTHValue || authorizationType === this.authorisationTypeAUTHValue);
    }
    async getAuthorisationType() {
        return config_handler_1.default.get(this.authorisationTypeKeyName) ? config_handler_1.default.get(this.authorisationTypeKeyName) : false;
    }
    async isAuthorisationTypeBasic() {
        return config_handler_1.default.get(this.authorisationTypeKeyName) === this.authorisationTypeAUTHValue ? true : false;
    }
    async isAuthorisationTypeOAuth() {
        return config_handler_1.default.get(this.authorisationTypeKeyName) === this.authorisationTypeOAUTHValue ? true : false;
    }
    async compareOAuthExpiry(force = false) {
        const oauthDateTime = config_handler_1.default.get(this.oauthDateTimeKeyName);
        const authorisationType = config_handler_1.default.get(this.authorisationTypeKeyName);
        if (oauthDateTime && authorisationType === this.authorisationTypeOAUTHValue) {
            const now = new Date();
            const oauthDate = new Date(oauthDateTime);
            const oauthValidUpto = new Date();
            oauthValidUpto.setTime(oauthDate.getTime() + 59 * 60 * 1000);
            if (force) {
                cli_ux_1.default.print('Force refreshing the token');
                return this.refreshToken();
            }
            else {
                if (oauthValidUpto > now) {
                    return Promise.resolve();
                }
                else {
                    cli_ux_1.default.print('Token expired, refreshing the token');
                    return this.refreshToken();
                }
            }
        }
        else {
            cli_ux_1.default.print('No OAuth set');
            return this.unsetConfigData();
        }
    }
}
exports.default = new AuthHandler();
