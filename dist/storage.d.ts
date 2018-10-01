export interface Storage {
    bootstrap(options: any): Promise<any>;
    save(uri: string, tags: string[], data: any, options: any): Promise<any>;
    exist(...uris: string[]): Promise<number>;
    release(): Promise<any>;
}
