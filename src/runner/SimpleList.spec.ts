import 'mocha';
import { launch, Browser, Page } from 'puppeteer';
import { SimpleListRunner, Task } from './SimpleList';
import { BrowserContextCreator, NativeBrowserContextCreator } from '../runner';
import * as log4js from "log4js";
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
        save: (uri: string, data: any, options: any): Promise<any> => {
            console.log("saving %s by %s data \n\n%s\n\n", uri, data.length, data);
            return
        },
        exist: (uri: string[]): Promise<number> => {
            return Promise.resolve(uri.length);
        },
    }
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
        class TestRunner0 extends SimpleListRunner {
            protected async processCategoryData(browser: BrowserContextCreator, page: Page, task: Task): Promise<boolean> {
                categoried++;
                switch (categoried) {
                    case 1:
                        this.detailQueue.push(new Task(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new Task(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new Task(task.tags, "http://www.baidu.com"));
                        this.categoryQueue.push(new Task(task.tags, "http://www.baidu.com"));
                    case 2:
                        this.detailQueue.push(new Task(task.tags, "http://www.baidu.com"));
                        this.detailQueue.push(new Task(task.tags, "http://www.baidu.com"));
                        this.categoryQueue.push(new Task(task.tags, "http://www.baidu.com"));
                    case 3:
                        this.categoryQueue.push(new Task(task.tags, "http://www.baidu.com"));
                }
                return categoried < 3;
            }
            protected async processDetailData(browser: BrowserContextCreator, page: Page, task: Task): Promise<any> {
                return { data: await page.evaluate(() => document.body.innerHTML) };
            }
        }
        await new TestRunner0({
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
        }, storage).process(browser)
    })

    after(async () => {
        await nativeBrowser.close();
    })
});