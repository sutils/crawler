import 'mocha';
import { launch, Browser, Page } from 'puppeteer';
import { SimpleListRunner, SimpleListTask } from './SimpleList';
import { BrowserContextCreator, NativeBrowserContextCreator } from '../runner';
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
    }
    it("TestRunner0", async () => {
        let nativeBrowser: Browser;
        let browser: NativeBrowserContextCreator
        nativeBrowser = await launch({
            args: ["--blink-settings=imagesEnabled=false", "--proxy-server="],
            headless: false,
        });
        browser = new NativeBrowserContextCreator(nativeBrowser);
        let categoried: number = 0;
        class TestRunner0 extends SimpleListRunner {
            protected async processCategoryData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<boolean> {
                categoried++;
                switch (categoried) {
                    case 1:
                        this.detailQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                        this.categoryQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                    case 2:
                        this.detailQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                        this.categoryQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                    case 3:
                        this.categoryQueue.push(new SimpleListTask(task.tags, "http://www.baidu.com"));
                }
                return categoried < 3;
            }
            protected async processDetailData(browser: BrowserContextCreator, page: Page, task: SimpleListTask): Promise<any> {
                await sleep(1000);
                return { data: await page.evaluate(() => document.body.innerHTML) };
            }
        }
        let runner = new TestRunner0("test", storage);
        runner.options = {
            "id": "test",
            "type": "TestRunner",
            "delay": 0,
            "limit": {
                "context": {
                    "max": 16,
                    "pages": 2
                },
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
        await nativeBrowser.close();
    })
    it("TestRunner1", async () => {
        let nativeBrowser: Browser;
        let browser: NativeBrowserContextCreator
        nativeBrowser = await launch({
            args: ["--blink-settings=imagesEnabled=false", "--proxy-server="],
            headless: false,
        });
        browser = new NativeBrowserContextCreator(nativeBrowser);
        class TestRunner1 extends SimpleListRunner {
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
        await nativeBrowser.close();
    })
});