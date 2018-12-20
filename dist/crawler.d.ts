import { BrowserContextCreator } from './runner';
import { Storage } from "./storage";
import { Browser } from 'puppeteer';
export declare class Crawler {
    storage: Storage;
    browser: Browser;
    protected tasks: Promise<any>[];
    Crawler(storage: Storage): void;
    createTask(options: any, browser: BrowserContextCreator): Promise<any>;
    run(conf: any): Promise<any>;
    close(): Promise<void>;
}
export * from "./util";
export * from "./storage";
export * from "./runner";
export * from "./runner/SimpleList";
