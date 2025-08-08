export default makeCacheManagerAuthState;
declare function makeCacheManagerAuthState(store: any, sessionKey: any): Promise<{
    clearState: () => Promise<void>;
    saveCreds: () => Promise<void>;
    state: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<{}>;
            set: (data: any) => Promise<void>;
        };
    };
}>;
