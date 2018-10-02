
export interface Storage {
    bootstrap(options: any): Promise<any>;
    save(uri: string, tags: string[], data: any, options: any): Promise<any>;
    find(fields: string, ...uris: string[]): Promise<any[]>;
    release(): Promise<any>;
}