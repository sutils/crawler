import { Runner, BrowserContextCreator } from "../runner";
import { Storage } from "../storage";
import { Page } from "puppeteer";
export declare class SimpleListTask {
    tags: string[];
    uri: string;
    options: any;
    constructor(tags?: string[], uri?: string, options?: any);
}
export declare class CategoryItemList {
    details: any[];
    categories: any[];
}
export declare class DetailPage {
    data: string;
    next: string;
}
export declare class DetailData {
    data: string;
    options: any;
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
    protected abstract processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList>;
    protected abstract processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any>;
    protected processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean>;
    protected processCategory(browser: BrowserContextCreator, pagesLimit: number): Promise<any>;
    protected gotoDetail(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;
    protected abstract processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage>;
    protected abstract processDetailPageData(task: SimpleListTask, data: string): Promise<string>;
    protected processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailData>;
    protected processDetail(browser: BrowserContextCreator, pagesLimit: number, index: number): Promise<any>;
    protected startProcessDetail(browser: BrowserContextCreator, pagesLimit: number): Promise<any>;
}
