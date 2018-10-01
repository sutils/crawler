"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const runner_1 = require("../runner");
const util_1 = require("../util");
const log4js = require("log4js");
const Log = log4js.getLogger("SimpleListRunner");
class SimpleListTask {
    constructor(tags, uri, options) {
        this.tags = tags;
        this.uri = uri;
        this.options = this.options;
    }
}
exports.SimpleListTask = SimpleListTask;
class SimpleListRunner {
    constructor(id, ...args) {
        this.detailQueue = [];
        this.detailRunning = 0;
        this.detailSequence = 0;
        this.detialProcessor = {};
        this.categoryQueue = [];
        this.id = id;
    }
    process(browser) {
        return __awaiter(this, void 0, void 0, function* () {
            Log.info("%s is starting by %s", this.id, JSON.stringify(this.options));
            let limited = new runner_1.MaxBrowserContextCreator(browser, this.options.limit.context.max);
            while (true) {
                yield this.processOnce(limited);
                if (this.options.delay) {
                    Log.info("%s will restart process after %sms", this.id, this.options.delay);
                    yield util_1.sleep(this.options.delay);
                }
                else {
                    Log.info("%s is done", this.id);
                    break;
                }
            }
        });
    }
    processOnce(browser) {
        return __awaiter(this, void 0, void 0, function* () {
            let pagesLimit = this.options.limit.context.pages;
            if (!pagesLimit)
                pagesLimit = 5;
            //
            for (let i = 0; i < this.options.categories.length; i++) {
                let category = this.options.categories[i];
                this.categoryQueue.push(new SimpleListTask(category.tags, category.uri));
            }
            yield this.processCategory(browser, pagesLimit);
            let allProcessor = [];
            for (var idx in this.detialProcessor) {
                allProcessor.push(this.detialProcessor[idx]);
            }
            Log.info("%s wait %s detail processor is done", this.id, allProcessor.length);
            yield Promise.all(allProcessor);
            Log.info("%s once process is done", this.id);
        });
    }
    gotoCategory(browser, page, task) {
        return __awaiter(this, void 0, void 0, function* () {
            return page.goto(task.uri, { waitUntil: "networkidle2" });
        });
    }
    processCategory(browser, pagesLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            Log.info("%s category process is starting with %s bootstrap category", this.id, this.categoryQueue.length);
            let page = null;
            let pageUsed = 0;
            while (this.categoryQueue.length) {
                let task = this.categoryQueue.pop();
                if (!page) {
                    page = yield browser.newPage(this.id);
                }
                try {
                    Log.info("%s start process category on %s", this.id, task.uri);
                    yield this.gotoCategory(browser, page, task);
                    if (yield this.processCategoryData(browser, page, task)) {
                        //new processs
                        this.startProcessDetail(browser, pagesLimit);
                    }
                }
                catch (e) {
                    Log.error("%s process category on %s fail with \n", this.id, task.uri, e);
                }
                pageUsed++;
                if (pageUsed >= pagesLimit) {
                    yield browser.freePage(this.id, page);
                    page = null;
                    pageUsed = 0;
                }
            }
            if (page) {
                yield browser.freePage(this.id, page);
                page = null;
                pageUsed = 0;
            }
            Log.info("%s category process is done", this.id);
        });
    }
    gotoDetail(browser, page, task) {
        return __awaiter(this, void 0, void 0, function* () {
            return page.goto(task.uri, { waitUntil: "networkidle2" });
        });
    }
    startProcessDetail(browser, pagesLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.detailRunning >= pagesLimit) {
                return;
            }
            this.detailRunning++;
            let index = this.detailSequence++;
            let processor = this.processDetail(browser, pagesLimit, index);
            this.detialProcessor[index] = processor;
        });
    }
    processDetail(browser, pagesLimit, index) {
        return __awaiter(this, void 0, void 0, function* () {
            Log.info("one detail process is starting");
            try {
                let page = null;
                let pageUsed = 0;
                while (this.detailQueue.length) {
                    let task = this.detailQueue.pop();
                    if (!page) {
                        page = yield browser.newPage(this.id);
                    }
                    try {
                        Log.info("%s start process detail on %s", this.id, task.uri);
                        yield this.gotoDetail(browser, page, task);
                        let result = yield this.processDetailData(browser, page, task);
                        yield this.storage.save(task.uri, result.data, result.options);
                    }
                    catch (e) {
                        Log.info("%s process detail on %s fail with\n", this.id, task.uri, e);
                    }
                    pageUsed++;
                    if (pageUsed >= pagesLimit) {
                        yield browser.freePage(this.id, page);
                        page = null;
                        pageUsed = 0;
                    }
                }
                if (page) {
                    yield browser.freePage(this.id, page);
                    page = null;
                    pageUsed = 0;
                }
                Log.info("one detail process is done");
            }
            catch (e) {
                Log.warn("one detail process is done with\n", e);
            }
            this.detailRunning--;
            delete this.detialProcessor[index];
        });
    }
}
exports.SimpleListRunner = SimpleListRunner;
//# sourceMappingURL=SimpleList.js.map