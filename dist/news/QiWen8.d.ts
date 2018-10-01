import { SimpleListRunner, SimpleListTask } from "../runner/SimpleList";
import { Page } from 'puppeteer';
import { BrowserContextCreator, DataStorage } from "../runner";
export declare class QiWen8Runner extends SimpleListRunner {
    Key: string;
    constructor(options: any, storage: DataStorage);
    protected processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean>;
    protected processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;
}
