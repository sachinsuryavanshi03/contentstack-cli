import { BaseClientDecorator } from './base-client-decorator';
import { HttpClient } from './client';
import { IHttpClient } from './client-interface';
import { HttpResponse } from './http-response';
export declare class HttpClientDecorator extends BaseClientDecorator {
    protected client: IHttpClient;
    constructor(client: IHttpClient);
    headers(headers: any): HttpClient;
    contentType(contentType: string): HttpClient;
    get<R>(url: string, queryParams?: object): Promise<HttpResponse<R>>;
    post<R>(url: string, payload?: any): Promise<HttpResponse<R>>;
    put<R>(url: string, payload?: any): Promise<HttpResponse<R>>;
    delete<R>(url: string, queryParams?: object): Promise<HttpResponse<R>>;
}
