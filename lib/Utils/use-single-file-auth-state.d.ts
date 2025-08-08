export function useSingleFileAuthState(filename: any): Promise<{
    state: {
        creds: any;
        keys: {
            get: (type: any, ids: any) => Promise<any>;
            set: (data: any) => Promise<void>;
        };
    };
    saveState: () => any;
}>;
