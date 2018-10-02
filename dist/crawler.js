"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
const runner_1 = require("./runner");
const puppeteer_1 = require("puppeteer");
const Log = log4js.getLogger("crawler");
class Crawler {
    constructor() {
        this.tasks = [];
    }
    Crawler(storage) {
        this.storage = storage;
    }
    createTask(options, browser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                Log.info("process task by %s", JSON.stringify(options));
                let runner = runner_1.NewRunner(options.type, options.id);
                if (!runner) {
                    Log.warn("process task by %s fail with runner is not exist by %s", JSON.stringify(options), options.type);
                    return;
                }
                runner.options = options;
                runner.storage = this.storage;
                yield runner.process(browser);
            }
            catch (e) {
                Log.trace("process task by %s fail with", JSON.stringify(options), e);
            }
        });
    }
    run(conf) {
        return __awaiter(this, void 0, void 0, function* () {
            Log.info("crawler is starting...");
            //
            //load storage
            if (!conf.storage.module) {
                throw new Error("storage.module is required");
            }
            Log.info("start load storage module by %s", conf.storage.module);
            let moduleNames = conf.storage.module.split(/\./);
            let module = require(moduleNames[0]);
            this.storage = (new module[moduleNames[1]]());
            yield this.storage.bootstrap(conf.storage);
            //
            //load browser
            const nativeBrowser = yield puppeteer_1.launch(conf.puppeteer);
            let userAgent = yield nativeBrowser.userAgent();
            let version = yield nativeBrowser.version();
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
            const browser = new runner_1.NativeBrowserContextCreator(nativeBrowser);
            for (let i = 0; i < conf.tasks.length; i++) {
                let task = conf.tasks[i];
                if (task.enable) {
                    this.tasks.push(this.createTask(task, browser));
                }
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            Log.info("crawler is stopping...");
            yield this.browser.close();
            yield Promise.all(this.tasks);
            Log.info("crawler is stopped");
        });
    }
}
exports.Crawler = Crawler;
__export(require("./util"));
__export(require("./runner"));
__export(require("./runner/SimpleList"));
//# sourceMappingURL=crawler.js.map