import { Browser, BrowserContext, Page } from 'puppeteer';
import { Storage } from "./storage";
export interface BrowserContextCreator {
    browser: Browser;
    createIncognitoBrowserContext(key: string): Promise<BrowserContext>;
    freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void>;
    newPage(key: string): Promise<Page>;
    freePage(key: string, page: Page): Promise<void>;
}
export declare class MaxBrowserContextCreator implements BrowserContextCreator {
    browser: Browser;
    max: number;
    creator: BrowserContextCreator;
    private waiting;
    private running;
    private pageContext;
    constructor(creator: BrowserContextCreator, max?: number);
    createIncognitoBrowserContext(key: string): Promise<BrowserContext>;
    freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void>;
    newPage(key: string): Promise<Page>;
    freePage(key: string, page: Page): Promise<void>;
}
export declare class NativeBrowserContextCreator implements BrowserContextCreator {
    browser: Browser;
    constructor(browser: Browser);
    createIncognitoBrowserContext(key: string): Promise<BrowserContext>;
    freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void>;
    newPage(key: string): Promise<Page>;
    freePage(key: string, page: Page): Promise<void>;
}
export interface Runner {
    id: string;
    options: any;
    storage: Storage;
    process(browser: BrowserContextCreator): Promise<any>;
}
export declare function Register(key: string, creator: (id: string, ...args: any[]) => Runner): void;
export declare function NewRunner(key: string, id: string, ...args: any[]): Runner;
