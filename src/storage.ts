
export interface Storage {
    bootstrap(options: any): Promise<any>;
    release(): Promise<any>;
}

export interface WebStorage extends Storage {
    save(uri: string, tags: string[], data: any, options: any): Promise<any>;
    find(fields: string, ...uris: string[]): Promise<any[]>;
}