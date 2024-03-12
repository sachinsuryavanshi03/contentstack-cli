"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLocale = void 0;
const http_client_1 = require("./http-client");
const addLocale = async (apiKey, managementToken, host) => {
    const httpClient = new http_client_1.HttpClient({
        headers: { api_key: apiKey, authorization: managementToken },
    });
    const { data } = await httpClient.post(`https://${host}/v3/locales`, {
        locale: {
            name: 'English',
            code: 'en-us',
        },
    });
    if ([161, 105].includes(data.error_code)) {
        throw new Error(data.error_code === 105 ? 'Sorry but you don\'t have access to this stack' : data.error_message);
    }
};
exports.addLocale = addLocale;
