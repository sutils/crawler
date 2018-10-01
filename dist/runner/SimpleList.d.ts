import { Runner, BrowserContextCreator } from "../runner";
import { Storage } from "../storage";
import { Page } from "puppeteer";
export declare class SimpleListTask {
    tags: string[];
    uri: string;
    options: any;
    constructor(tags?: string[], uri?: string, options?: any);
}
export declare abstract class SimpleListRunner implements Runner {
    id: string;
    options: any;
    storage: Storage;
    protected detailQueue: SimpleListTask[];
    protected detailRunning: number;
    protected detailSequence: number;
    protected detialProcessor: any;
    protected categoryQueue: SimpleListTask[];
    constructor(id: string, ...args: any[]);
    process(browser: BrowserContextCreator): Promise<any>;
    protected processOnce(browser: BrowserContextCreator): Promise<any>;
    protected gotoCategory(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;
    protected abstract processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean>;
    protected processCategory(browser: BrowserContextCreator, pagesLimit: number): Promise<any>;
    protected gotoDetail(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;
    protected abstract processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;
    protected startProcessDetail(browser: BrowserContextCreator, pagesLimit: number): Promise<any>;
    protected processDetail(browser: BrowserContextCreator, pagesLimit: number, index: number): Promise<any>;
}
