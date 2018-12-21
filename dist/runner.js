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
const log4js = require("log4js");
const Log = log4js.getLogger("runner");
class MaxBrowserContextCreator {
    constructor(creator, max) {
        this.max = 3;
        this.waiting = [];
        this.running = 0;
        this.creator = creator;
        this.browser = creator.browser;
        this.max = max ? max : 3;
    }
    createIncognitoBrowserContext(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (this.running >= this.max) {
                    this.waiting.push({ resolve: resolve, reject: reject });
                    return;
                }
                this.running++;
                resolve(yield this.creator.createIncognitoBrowserContext(key));
            }));
        });
    }
    freeIncognitoBrowserContext(key, context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.creator.freeIncognitoBrowserContext(key, context);
            if (this.waiting.length) {
                let next = this.waiting.pop();
                next.resolve(yield this.creator.createIncognitoBrowserContext(key));
                return;
            }
            this.running--;
        });
    }
    newPage(key) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = yield this.createIncognitoBrowserContext(key);
            let page = yield context.newPage();
            page["_context_"] = context;
            return page;
        });
    }
    freePage(key, page) {
        return __awaiter(this, void 0, void 0, function* () {
            let context = (page["_context_"]);
            yield page.close();
            return this.freeIncognitoBrowserContext(key, context);
        });
    }
}
exports.MaxBrowserContextCreator = MaxBrowserContextCreator;
class CacheBrowserContextCreator {
    constructor(creator, max) {
        this.max = 3;
        this.contextCache = [];
        this.pageCache = [];
        this.creator = creator;
        this.browser = creator.browser;
        this.max = max ? max : 3;
    }
    createIncognitoBrowserContext(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.contextCache.length) {
                return this.contextCache.pop();
            }
            else {
                return yield this.creator.createIncognitoBrowserContext(key);
            }
        });
    }
    freeIncognitoBrowserContext(key, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.contextCache.length >= this.max) {
                yield this.creator.freeIncognitoBrowserContext(key, context);
            }
            else {
                this.contextCache.push(context);
            }
        });
    }
    newPage(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pageCache.length) {
                return this.pageCache.pop();
            }
            else {
                return yield this.creator.newPage(key);
            }
        });
    }
    freePage(key, page) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pageCache.length >= this.max) {
                yield this.creator.freePage(key, page);
            }
            else {
                this.pageCache.push(page);
            }
        });
    }
}
exports.CacheBrowserContextCreator = CacheBrowserContextCreator;
class NativeBrowserContextCreator {
    constructor(browser) {
        this.browser = browser;
    }
    createIncognitoBrowserContext(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.browser.createIncognitoBrowserContext();
        });
    }
    freeIncognitoBrowserContext(key, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return context.close();
        });
    }
    newPage(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.browser.newPage();
        });
    }
    freePage(key, page) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield page.close();
        });
    }
}
exports.NativeBrowserContextCreator = NativeBrowserContextCreator;
var runners = {};
function Register(key, creator) {
    runners[key] = creator;
    Log.info("register one %s runner creator success", key);
}
exports.Register = Register;
function NewRunner(key, id, ...args) {
    let creator = runners[key];
    if (creator) {
        return runners[key](id, ...args);
    }
    else {
        return null;
    }
}
exports.NewRunner = NewRunner;
//# sourceMappingURL=runner.js.map