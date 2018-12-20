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
        if (conf.loadedStorage) {
            this.storage = conf.loadedStorage
        } else {
            if (!conf.storage || !conf.storage.module) {
                throw new Error("storage.module is required");
            }
            Log.info("start load storage module by %s", conf.storage.module);
            let moduleNames = conf.storage.module.split(/\./);
            let module = require(moduleNames[0]);
            this.storage = (new module[moduleNames[1]]()) as Storage;
            await this.storage.bootstrap(conf.storage);
        }
        //
        //load browser
        this.browser = await launch(conf.puppeteer);
        let userAgent = await this.browser.userAgent();
        let version = await this.browser.version();
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
        const browser = new NativeBrowserContextCreator(this.browser);
        for (let i = 0; i < conf.tasks.length; i++) {
            let task = conf.tasks[i];
            if (task.enable) {
                this.tasks.push(this.createTask(task, browser));
            }
        }
    }

    public async close() {
        Log.info("crawler is stopping...");
        await this.browser.close();
        await this.storage.release();
        await Promise.all(this.tasks);
        Log.info("crawler is stopped");
    }
}
export * from "./util";
export * from "./storage";
export * from "./runner";
export * from "./runner/SimpleList";