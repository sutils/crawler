import * as log4js from "log4js";
import { NativeBrowserContextCreator, BrowserContextCreator, NewRunner } from './runner';
import { Storage } from "./storage";
import { Browser, launch } from 'puppeteer';

const Log = log4js.getLogger("crawler");

export class Crawler {
    protected storage: Storage;
    protected browser: Browser;
    protected tasks: Promise<any>[] = [];

    public Crawler(storage: Storage) {
        this.storage = storage;
    }

    public async createTask(options: any, browser: BrowserContextCreator): Promise<any> {
        try {
            Log.info("process task by %s", JSON.stringify(options));
            let runner = NewRunner(options.type, options.id);
            if (!runner) {
                Log.warn("process task by %s fail with runner is not exist by %s", JSON.stringify(options), options.type);
                return;
            }
            runner.options = options;
            runner.storage = this.storage;
            await runner.process(browser);
        } catch (e) {
            Log.trace("process task by %s fail with", JSON.stringify(options), e)
        }
    }

    public async run(conf: any): Promise<any> {
        Log.info("crawler is starting...");
        //
        //load storage
        if (!conf.storage.module) {
            throw new Error("storage.module is required");
        }
        Log.info("start load storage module by %s", conf.storage.module);
        let moduleNames = conf.storage.module.split(".");
        let module = require(moduleNames[0]);
        this.storage = (new module[moduleNames[1]]()) as Storage;
        await this.storage.bootstrap(conf.storage);
        //
        //load browser
        let proxy = conf.proxy ? conf.proxy : "";
        const nativeBrowser = await launch({
            args: ["--blink-settings=imagesEnabled=false", "--proxy-server=" + proxy]
        });
        let userAgent = await nativeBrowser.userAgent();
        let version = await nativeBrowser.version();
        Log.info("crawler is using chrome:" + version + ", agent:" + userAgent);
        //
        //load runner
        for (let i = 0; i < conf.runners.length; i++) {
            let name = conf.runners[i];
            require(name);
            Log.info("crawler load runner by %s success", name);
        }
        //
        //process task
        const browser = new NativeBrowserContextCreator(nativeBrowser);
        for (let i = 0; i < conf.tasks.length; i++) {
            this.tasks.push(this.createTask(conf.tasks[i], browser));
        }
    }

    public async close() {
        Log.info("crawler is stopping...");
        await this.browser.close();
        await Promise.all(this.tasks);
        Log.info("crawler is stopped");
    }
}
export * from "./util";
export * from "./storage";
export * from "./runner";
export * from "./runner/SimpleList";