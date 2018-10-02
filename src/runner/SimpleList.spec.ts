import 'mocha';
import { launch, Browser, Page } from 'puppeteer';
import { SimpleListRunner, SimpleListTask, CategoryItemList, DetailPage, DetailData } from './SimpleList';
import { BrowserContextCreator, NativeBrowserContextCreator, MaxBrowserContextCreator } from '../runner';
import * as log4js from "log4js";
import { sleep } from '../util';
describe('SimpleList', async () => {
    log4js.configure({
        appenders: {
            ruleConsole: { type: 'console' }
        },
        categories: {
            default: { appenders: ['ruleConsole'], level: "debug" }
        },
        // replaceConsole:true
    });
    let nativeBrowser: Browser;
    let browser: NativeBrowserContextCreator

    before(async () => {
        nativeBrowser = await launch({
            args: ["--blink-settings=imagesEnabled=false", "--proxy-server="],
            headless: false,
        });
        browser = new NativeBrowserContextCreator(nativeBrowser);
    })

    it("TestRunner0", async () => {
        let categoried: number = 0;
        let detailed: number = 0;
        let storage = {
            bootstrap: (options: any): Promise<any> => {
                return;
            },
            save: async (uri: string, tags: string[], data: any, options: any): Promise<any> => {
                console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
                return
            },
            find: async (fields: string, ...uris: string[]): Promise<any[]> => {
                let rs: any[] = [];
                if (categoried == 4) {
                    for (let i = 0; i < uris.length; i++) {
                        rs.push({ uri: uris[i] });
                    }
                }
                return rs;
            },
            release: (): Promise<any> => {
                return;
            }
        };
        class TestRunner0 extends SimpleListRunner {

            protected async processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList> {
                let list = new CategoryItemList();
                categoried++;
                switch (categoried) {
                    case 1:
                        list.details.push({ uri: "http://www.baidu.com" });
                        list.details.push({ uri: "http://www.baidu.com" });
                        list.categories.push({ uri: "http://www.baidu.com" });
                    case 2:
                        list.details.push({ uri: "http://www.baidu.com" });
                        list.categories.push({ uri: "http://www.baidu.com" });
                    case 3:
                        list.details.push({ uri: "http://www.baidu.com" });
                        list.categories.push({ uri: "http://www.baidu.com" });
                    case 4:
                        list.categories.push({ uri: "http://www.baidu.com" });
                    case 5:
                        list.details.push({ uri: "http://www.baidu.com" });
                }
                return list;
            }

            protected async processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any> {
                return task.options;
            }

            protected async processDetailPageData(task: SimpleListTask, data: string): Promise<string> {
                return data;
            }

            protected async processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage> {
                detailed++;
                let detail = new DetailPage();
                detail.data = await page.evaluate(() => document.body.innerHTML);
                if (detailed > 3) {
                    detail.next = "";
                } else {
                    detail.next = "http://www.baidu.com";
                }
                return detail;
            }
        }
        let runner = new TestRunner0("test", storage);
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 0,
            "limit": {
                "context": {
                    "max": 2,
                    "pages": 3
                },
                "categories": {
                    "page_max": 2,
                    "item_max": 2,
                }
            },
            "categories": [
                {
                    "uri": "http://www.baidu.com",
                    "tags": ["test"]
                }
            ]
        };
        runner.storage = storage;
        await runner.process(browser);
    })

    it("wait detail", async () => {
        let categoried: number = 0;
        let storage = {
            bootstrap: (options: any): Promise<any> => {
                return;
            },
            save: async (uri: string, tags: string[], data: any, options: any): Promise<any> => {
                console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
                return
            },
            find: async (fields: string, ...uris: string[]): Promise<any[]> => {
                let rs: any[] = [];
                return rs;
            },
            release: (): Promise<any> => {
                return;
            }
        };
        class TestRunner0 extends SimpleListRunner {

            protected async processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList> {
                let list = new CategoryItemList();
                categoried++;
                if (categoried == 1) {
                    list.details.push({ uri: "http://www.baidu.com" });
                    list.details.push({ uri: "http://www.baidu.com" });
                    list.categories.push({ uri: "http://www.baidu.com" });
                }
                return list;
            }

            protected async processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any> {
                return task.options;
            }

            protected async processDetailPageData(task: SimpleListTask, data: string): Promise<string> {
                return data;
            }

            protected async processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage> {
                await sleep(100);
                let detail = new DetailPage();
                detail.data = await page.evaluate(() => document.body.innerHTML);
                detail.next = "";
                return detail;
            }
        }
        let runner = new TestRunner0("test", storage);
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 0,
            "limit": {
                "context": {
                    "max": 2,
                    "pages": 3
                },
                "categories": {
                    "page_max": 2,
                    "item_max": 2,
                }
            },
            "categories": [
                {
                    "uri": "http://www.baidu.com",
                    "tags": ["test"]
                }
            ]
        };
        runner.storage = storage;
        await runner.process(browser);
    })

    it("processDetail", async () => {
        let categoried: number = 0;
        let storage = {
            bootstrap: (options: any): Promise<any> => {
                return;
            },
            save: async (uri: string, tags: string[], data: any, options: any): Promise<any> => {
                console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
                return
            },
            find: async (fields: string, ...uris: string[]): Promise<any[]> => {
                let rs: any[] = [];
                return rs;
            },
            release: (): Promise<any> => {
                return;
            }
        };
        class TestRunner0 extends SimpleListRunner {

            protected async processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList> {
                let list = new CategoryItemList();
                return list;
            }

            protected async processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any> {
                return task.options;
            }

            protected async processDetailPageData(task: SimpleListTask, data: string): Promise<string> {
                return data;
            }

            protected async processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage> {
                let detail = new DetailPage();
                detail.data = await page.evaluate(() => document.body.innerHTML);
                detail.next = "";
                return detail;
            }

            public async processDetailTask(browser: BrowserContextCreator, ...tasks: SimpleListTask[]): Promise<any> {
                this.detailQueue = tasks;
                await this.startProcessDetail(browser, 2)
            }

            public async waitAll(): Promise<any> {
                let allProcessor = [];
                for (var idx in this.detialProcessor) {
                    allProcessor.push(this.detialProcessor[idx]);
                }
                return Promise.all(allProcessor);
            }

        }
        let runner = new TestRunner0("test", storage);
        runner.storage = storage;
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 0,
            "limit": {
                "context": {
                    "max": 2,
                    "pages": 3
                },
                "categories": {
                    "page_max": 2,
                    "item_max": 2,
                }
            },
            "categories": [
                {
                    "uri": "http://www.baidu.com",
                    "tags": ["test"]
                }
            ]
        };
        let xbrowser = new MaxBrowserContextCreator(browser, 5)
        await runner.processDetailTask(xbrowser,
            {
                uri: "http://www.baidu.com",
                tags: ["t0"],
                options: null,
            },
            {
                uri: "http://www.baidu.com",
                tags: ["t0"],
                options: null,
            }
        );
        await runner.waitAll();
        await runner.processDetailTask(xbrowser,
            {
                uri: "http://www.baidu.com",
                tags: ["t0"],
                options: null,
            }
        );
        await runner.waitAll();
    })

    it("delay", async () => {
        let storage = {
            bootstrap: (options: any): Promise<any> => {
                return;
            },
            save: (uri: string, tags: string[], data: any, options: any): Promise<any> => {
                console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
                return
            },
            find: (fields: string, ...uris: string[]): Promise<any[]> => {
                throw new Error("not impl");
            },
            release: (): Promise<any> => {
                return;
            }
        };
        class TestRunner1 extends SimpleListRunner {

            protected async processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList> {
                throw "not impl";
            }

            protected async processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any> {
                throw "not impl";
            }

            protected async processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage> {
                throw "not impl";
            }

            protected async processDetailPageData(task: SimpleListTask, data: string): Promise<string> {
                throw "not impl";
            }

            protected async processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean> {
                return false;
            }

            protected async processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any> {
                throw new Error("error");
            }
        }
        let runner = new TestRunner1("test", storage);
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 100,
            "limit": {
                "context": {
                    "max": 16,
                },
            },
            "categories": []
        };
        runner.storage = storage;
        setTimeout(() => {
            runner.options.delay = 0;
        }, 500)
        await runner.process(browser);
    })

    it("error", async () => {
        let categoried: number = 0;
        let storage = {
            bootstrap: (options: any): Promise<any> => {
                return;
            },
            save: async (uri: string, tags: string[], data: any, options: any): Promise<any> => {
                console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
                return
            },
            find: async (fields: string, ...uris: string[]): Promise<any[]> => {
                let rs: any[] = [];
                return rs;
            },
            release: (): Promise<any> => {
                return;
            }
        };
        class TestRunner0 extends SimpleListRunner {

            protected async processCategoryItemList(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<CategoryItemList> {
                let list = new CategoryItemList();
                return list;
            }

            protected async processCategoryItemOptions(task: SimpleListTask, detail: any): Promise<any> {
                return task.options;
            }

            protected async processDetailPageData(task: SimpleListTask, data: string): Promise<string> {
                return data;
            }

            protected async processDetailPage(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailPage> {
                return;
            }

            public async processCategoryErr1(browser: BrowserContextCreator): Promise<any> {
                this.categoryQueue = [new SimpleListTask(["t0"], "http://www.baidu.com")];
                return this.processCategory(browser, 6);
            }

            protected async processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean> {
                throw new Error("test error")
            }

            public async processDetailErr1(browser: BrowserContextCreator): Promise<any> {
                this.detailQueue = null;
                return this.processDetail(browser, 6, 1);
            }
            public async processDetailErr2(browser: BrowserContextCreator): Promise<any> {
                this.detailQueue = [new SimpleListTask(["t0"], "http://www.baidu.com")];
                return this.processDetail(browser, 6, 1);
            }
            protected async processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<DetailData> {
                throw new Error("test error")
            }

        }
        let runner = new TestRunner0("test", storage);
        runner.storage = storage;
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 0,
            "limit": {
                "context": {
                    "max": 2,
                    "pages": 3
                },
                "categories": {
                    "page_max": 2,
                    "item_max": 2,
                }
            },
            "categories": [
                {
                    "uri": "http://www.baidu.com",
                    "tags": ["test"]
                }
            ]
        };
        let xbrowser = new MaxBrowserContextCreator(browser, 5)
        await runner.processCategoryErr1(xbrowser);
        await runner.processDetailErr1(xbrowser);
        await runner.processDetailErr2(xbrowser);
    })

    after(async () => {
        await nativeBrowser.close();
    })
});