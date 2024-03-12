import { App, AppData } from '@contentstack/marketplace-sdk/types/marketplace/app';
import { ContentstackConfig, ContentstackClient, ContentstackToken } from '@contentstack/marketplace-sdk';
import { Installation } from '@contentstack/marketplace-sdk/types/marketplace/installation';
type ConfigType = Pick<ContentstackConfig, 'host' | 'endpoint' | 'retryDelay' | 'retryLimit'> & {
    skipTokenValidity?: string;
};
type ContentstackMarketplaceConfig = ContentstackConfig;
type ContentstackMarketplaceClient = ContentstackClient;
declare class MarketplaceSDKInitiator {
    private analyticsInfo;
    /**
     * The function returns a default configuration object for Contentstack API requests in TypeScript.
     * @returns a default configuration object of type `ContentstackConfig`.
     */
    get defaultOptions(): ContentstackConfig;
    init(context: any): void;
    /**
     * The function `refreshTokenHandler` returns a promise that resolves with a `ContentstackToken`
     * object based on the `authorizationType` parameter.
     * @param {string} authorizationType - The `authorizationType` parameter is a string that specifies
     * the type of authorization being used. It can have one of the following values:
     * @returns The refreshTokenHandler function returns a function that returns a Promise of type
     * ContentstackToken.
     */
    refreshTokenHandler(authorizationType: string): () => Promise<ContentstackToken>;
    /**
     * The function creates a Contentstack SDK client with the provided configuration.
     * @param config - The `config` parameter is an object that contains the following properties:
     * @returns a Promise that resolves to a ContentstackClient object.
     */
    createAppSDKClient(config?: ConfigType): Promise<ContentstackClient>;
}
export declare const marketplaceSDKInitiator: MarketplaceSDKInitiator;
declare const marketplaceSDKClient: typeof marketplaceSDKInitiator.createAppSDKClient;
export { App, AppData, Installation, MarketplaceSDKInitiator, ContentstackMarketplaceConfig, ContentstackMarketplaceClient, };
export default marketplaceSDKClient;
