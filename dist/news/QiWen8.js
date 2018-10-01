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
const SimpleList_1 = require("../runner/SimpleList");
const log4js = require("log4js");
const Log = log4js.getLogger("QiWen8Runner");
class QiWen8Runner extends SimpleList_1.SimpleListRunner {
    constructor(options, storage) {
        super(options, storage);
        this.Key = "QiWen8";
    }
    processCategoryData(browser, page, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let pageMax = this.options.limit.categories.page_max;
            let itemMax = this.options.limit.categories.item_max;
            /* istanbul ignore next */
            let resultData = yield page.evaluate((pageMax, itemMax) => new Promise((resolve, reject) => {
                try {
                    console.log("process category data by page_max:%s,item_max:%s", pageMax, itemMax);
                    var absoluteUrl = (function () {
                        var a = document.createElement('a');
                        return function (u) {
                            a.href = u;
                            return a.href;
                        };
                    })();
                    var details = [];
                    var items = document.querySelectorAll(".news-list li .mr-item-pic");
                    console.log("process items data by %s found", items.length);
                    for (var i = 0; i < items.length; i++) {
                        if (itemMax > 0 && i >= itemMax) {
                            break;
                        }
                        var item = items[i];
                        var image = item.querySelector("img");
                        details.push({
                            title: item.getAttribute("title"),
                            uri: absoluteUrl(item.getAttribute("href")),
                            image: absoluteUrl(image.getAttribute("src")),
                        });
                    }
                    //
                    var categories = [];
                    var current = document.querySelector(".paging-box .thisclass");
                    if (!pageMax || parseInt(current.innerHTML) < pageMax) {
                        var pages = document.querySelectorAll(".paging-box a");
                        var next = "";
                        for (var j = 0; j < pages.length; j++) {
                            var page = pages[j];
                            if (page.className.indexOf("thisclass") < 0) {
                                continue;
                            }
                            if (j + 1 < pages.length) {
                                next = pages[j + 1].getAttribute("href");
                                break;
                            }
                        }
                        if (next.length) {
                            categories.push({
                                uri: absoluteUrl(next),
                            });
                        }
                    }
                    resolve(JSON.stringify({
                        details: details,
                        categories: categories,
                    }));
                }
                catch (e) {
                    reject(e);
                }
            }), pageMax, itemMax);
            let result = JSON.parse(resultData);
            let categoryFound = 0;
            if (result.categories && result.categories.length) {
                for (let i = 0; i < result.categories.length; i++) {
                    this.categoryQueue.push(new SimpleList_1.SimpleListTask(task.tags, result.categories[i].uri, task.options));
                }
                categoryFound = result.categories.length;
            }
            let detailFound = 0;
            if (result.details && result.details.length) {
                for (let i = 0; i < result.details.length; i++) {
                    let detail = result.details[i];
                    this.detailQueue.push(new SimpleList_1.SimpleListTask(task.tags, detail.uri, {
                        title: detail.title,
                        image: detail.image,
                    }));
                }
                detailFound = result.details.length;
            }
            Log.info("%s process category is done with category:%s,detail:%s on %s", this.id, categoryFound, detailFound, task.uri);
            return detailFound > 0;
        });
    }
    processDetailData(browser, page, task) {
        return __awaiter(this, void 0, void 0, function* () {
            let allData = `
        <style type="text/css">
            img {
                width: 99%;
            }
        </style>
        `;
            while (true) {
                /* istanbul ignore next */
                let resultData = yield page.evaluate(() => new Promise((resolve, reject) => {
                    try {
                        var absoluteUrl = (function () {
                            var a = document.createElement('a');
                            return function (u) {
                                a.href = u;
                                return a.href;
                            };
                        })();
                        var result = {};
                        //
                        var data = document.querySelector("#page-wrap").innerHTML;
                        data = data.replace(/href\s*=\s*"[^"]*"/g, "href=\"#\"");
                        data = data.replace(/src\s*=\s*"[^"]*"/g, (m) => {
                            return "src=\"" + absoluteUrl(m.split("\"")[1]) + "\"";
                        });
                        result.data = data;
                        //
                        var pages = document.querySelectorAll(".paging-box a");
                        result.next = "";
                        for (var j = 0; j < pages.length; j++) {
                            var page = pages[j];
                            if (page.className.indexOf("thisclass") < 0) {
                                continue;
                            }
                            if (j + 1 < pages.length) {
                                result.next = pages[j + 1].getAttribute("href");
                                break;
                            }
                        }
                        if (result.next) {
                            result.next = absoluteUrl(result.next);
                        }
                        resolve(JSON.stringify(result));
                    }
                    catch (e) {
                        reject(e);
                    }
                }));
                let result = JSON.parse(resultData);
                allData += result.data;
                if (!result.next) {
                    break;
                }
                yield page.goto(result.next, { waitUntil: "networkidle2" });
            }
            return { data: allData };
        });
    }
}
exports.QiWen8Runner = QiWen8Runner;
//# sourceMappingURL=QiWen8.js.map