export declare const isAuthenticated: () => boolean;
export declare const doesBranchExist: (stack: any, branchName: any) => Promise<any>;
export declare const isManagementTokenValid: (stackAPIKey: any, managementToken: any) => Promise<{
    valid: boolean;
    message?: undefined;
} | {
    valid: boolean;
    message: any;
} | {
    valid: string;
    message: string;
}>;
