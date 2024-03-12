import { BaseClientDecorator } from './base-client-decorator';
import { HttpClient } from './client';
import { IHttpClient } from './client-interface';
import { HttpResponse } from './http-response';
export declare class OauthDecorator extends BaseClientDecorator {
    protected client: IHttpClient;
    constructor(client: IHttpClient);
    preHeadersCheck(config: any): Promise<any>;
    headers(headers: any): HttpClient;
    contentType(contentType: string): HttpClient;
    get<R>(url: string, queryParams: object): Promise<HttpResponse<R>>;
    post<R>(url: string, payload?: object): Promise<HttpResponse<R>>;
    put<R>(url: string, payload?: object): Promise<HttpResponse<R>>;
    delete<R>(url: string, queryParams?: object): Promise<HttpResponse<R>>;
}
