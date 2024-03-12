"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isManagementTokenValid = exports.doesBranchExist = exports.isAuthenticated = void 0;
const tslib_1 = require("tslib");
const auth_handler_1 = tslib_1.__importDefault(require("./auth-handler"));
const _1 = require(".");
const isAuthenticated = () => auth_handler_1.default.isAuthenticated();
exports.isAuthenticated = isAuthenticated;
const doesBranchExist = async (stack, branchName) => {
    return stack
        .branch(branchName)
        .fetch()
        .catch((error) => {
        return error;
    });
};
exports.doesBranchExist = doesBranchExist;
const isManagementTokenValid = async (stackAPIKey, managementToken) => {
    var _a;
    const httpClient = new _1.HttpClient({ headers: { api_key: stackAPIKey, authorization: managementToken } });
    try {
        const response = (_a = (await httpClient.get(`${_1.configHandler.get('region').cma}/v3/environments?limit=1`))) === null || _a === void 0 ? void 0 : _a.data;
        if (response === null || response === void 0 ? void 0 : response.environments) {
            return { valid: true };
        }
        else if (response === null || response === void 0 ? void 0 : response.error_code) {
            return { valid: false, message: response.error_message };
        }
        else {
            throw typeof response === "string" ? response : "";
        }
    }
    catch (error) {
        return { valid: 'failedToCheck', message: `Failed to check the validity of the Management token. ${error}` };
    }
};
exports.isManagementTokenValid = isManagementTokenValid;
