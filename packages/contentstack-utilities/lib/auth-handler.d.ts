/**
 * @class
 * Auth handler
 */
declare class AuthHandler {
    private _host;
    private codeVerifier;
    private OAuthBaseURL;
    private OAuthAppId;
    private OAuthClientId;
    private OAuthRedirectURL;
    private OAuthScope;
    private OAuthResponseType;
    private authTokenKeyName;
    private authEmailKeyName;
    private oauthAccessTokenKeyName;
    private oauthDateTimeKeyName;
    private oauthUserUidKeyName;
    private oauthOrgUidKeyName;
    private oauthRefreshTokenKeyName;
    private authorisationTypeKeyName;
    private authorisationTypeOAUTHValue;
    private authorisationTypeAUTHValue;
    private allAuthConfigItems;
    private logger;
    set host(contentStackHost: any);
    constructor();
    initLog(): void;
    setOAuthBaseURL(): Promise<void>;
    oauth(): Promise<object>;
    createHTTPServer(): Promise<object>;
    openOAuthURL(): Promise<object>;
    getAccessToken(code: string): Promise<object>;
    setConfigData(type: string, userData?: any): Promise<object>;
    unsetConfigData(type?: string): Promise<void>;
    refreshToken(): Promise<object>;
    getUserDetails(data: any): Promise<object>;
    oauthLogout(): Promise<object>;
    /**
     * Fetches all authorizations for the Oauth App, returns authorizationUid for current user.
     * @returns authorizationUid for the current user
     */
    getOauthAppAuthorization(): Promise<string | undefined>;
    revokeOauthAppAuthorization(authorizationId: any): Promise<object>;
    isAuthenticated(): boolean;
    getAuthorisationType(): Promise<any>;
    isAuthorisationTypeBasic(): Promise<boolean>;
    isAuthorisationTypeOAuth(): Promise<boolean>;
    checkExpiryAndRefresh: (force?: boolean) => Promise<void | object>;
    compareOAuthExpiry(force?: boolean): Promise<void | object>;
}
declare const _default: AuthHandler;
export default _default;
