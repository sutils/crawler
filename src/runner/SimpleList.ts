import { Runner, BrowserContextCreator, MaxBrowserContextCreator } from "../runner";
import { Storage } from "../storage"
import { Page } from "puppeteer";
import { sleep } from "../util";
import * as log4js from "log4js";


const Log = log4js.getLogger("SimpleListRunner");

export class SimpleListTask {
    public tags: string[]
    public uri: string
    public options: any;
    public constructor(tags?: string[], uri?: string, options?: any) {
        this.tags = tags;
        this.uri = uri;
        this.options = this.options
    }
}


export abstract class SimpleListRunner implements Runner {
    public id: string
    public options: any;
    public storage: Storage;
    protected detailQueue: SimpleListTask[] = [];
    protected detailRunning: number = 0;
    protected detailSequence: number = 0;
    protected detialProcessor: any = {};
    protected categoryQueue: SimpleListTask[] = [];

    public constructor(id: string, ...args: any[]) {
        this.id = id;
    }

    public async process(browser: BrowserContextCreator): Promise<any> {
        Log.info("%s is starting by %s", this.id, JSON.stringify(this.options));
        let limited = new MaxBrowserContextCreator(browser, this.options.limit.context.max);
        while (true) {
            await this.processOnce(limited);
            if (this.options.delay) {
                Log.info("%s will restart process after %sms", this.id, this.options.delay);
                await sleep(this.options.delay);
            } else {
                Log.info("%s is done", this.id);
                break;
            }
        }
    }

    protected async processOnce(browser: BrowserContextCreator): Promise<any> {
        let pagesLimit = this.options.limit.context.pages;
        if (!pagesLimit) pagesLimit = 5;
        //
        for (let i = 0; i < this.options.categories.length; i++) {
            let category = this.options.categories[i];
            this.categoryQueue.push(new SimpleListTask(category.tags, category.uri));
        }
        await this.processCategory(browser, pagesLimit)
        let allProcessor = [];
        for (var idx in this.detialProcessor) {
            allProcessor.push(this.detialProcessor[idx]);
        }
        Log.info("%s wait %s detail processor is done", this.id, allProcessor.length);
        await Promise.all(allProcessor);
        Log.info("%s once process is done", this.id);
    }

    protected async gotoCategory(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any> {
        return page.goto(task.uri, { waitUntil: "networkidle2" });
    }

    protected abstract async processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean>;

    protected async processCategory(browser: BrowserContextCreator, pagesLimit: number): Promise<any> {
        Log.info("%s category process is starting with %s bootstrap category", this.id, this.categoryQueue.length);
        let page: Page = null;
        let pageUsed: number = 0;
        while (this.categoryQueue.length) {
            let task = this.categoryQueue.pop();
            if (!page) {
                page = await browser.newPage(this.id);
            }
            try {
                Log.info("%s start process category on %s", this.id, task.uri);
                await this.gotoCategory(browser, page, task);
                if (await this.processCategoryData(browser, page, task)) {
                    //new processs
                    this.startProcessDetail(browser, pagesLimit);
                }
            } catch (e) {
                Log.error("%s process category on %s fail with \n", this.id, task.uri, e);
            }
            pageUsed++;
            if (pageUsed >= pagesLimit) {
                await browser.freePage(this.id, page);
                page = null;
                pageUsed = 0;
            }
        }
        if (page) {
            await browser.freePage(this.id, page);
            page = null;
            pageUsed = 0;
        }
        Log.info("%s category process is done", this.id);
    }

    protected async gotoDetail(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any> {
        return page.goto(task.uri, { waitUntil: "networkidle2" });
    }

    protected abstract async processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any>;

    protected async startProcessDetail(browser: BrowserContextCreator, pagesLimit: number): Promise<any> {
        if (this.detailRunning >= pagesLimit) {
            return;
        }
        this.detailRunning++
        let index = this.detailSequence++;
        let processor = this.processDetail(browser, pagesLimit, index);
        this.detialProcessor[index] = processor;
    }

    protected async processDetail(browser: BrowserContextCreator, pagesLimit: number, index: number): Promise<any> {
        Log.info("one detail process is starting")
        try {
            let page: Page = null;
            let pageUsed: number = 0;
            while (this.detailQueue.length) {
                let task = this.detailQueue.pop();
                if (!page) {
                    page = await browser.newPage(this.id);
                }
                try {
                    Log.info("%s start process detail on %s", this.id, task.uri);
                    await this.gotoDetail(browser, page, task);
                    let result = await this.processDetailData(browser, page, task);
                    await this.storage.save(task.uri, task.tags, result.data, result.options);
                } catch (e) {
                    Log.info("%s process detail on %s fail with\n", this.id, task.uri, e);
                }
                pageUsed++;
                if (pageUsed >= pagesLimit) {
                    await browser.freePage(this.id, page);
                    page = null;
                    pageUsed = 0;
                }
            }
            if (page) {
                await browser.freePage(this.id, page);
                page = null;
                pageUsed = 0;
            }
            Log.info("one detail process is done");
        } catch (e) {
            Log.warn("one detail process is done with\n", e);
        }
        this.detailRunning--;
        delete this.detialProcessor[index];
    }

}