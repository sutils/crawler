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
const fs_1 = require("fs");
const log4js = require("log4js");
const crawler_1 = require("crawler");
let confPath = __dirname + "/conf/crawler.json";
if (process.argv.length > 2) {
    confPath = process.argv[2];
}
let conf = JSON.parse(fs_1.readFileSync(confPath).toString("utf-8"));
const Log = log4js.getLogger("main");
(() => __awaiter(this, void 0, void 0, function* () {
    log4js.configure({
        appenders: {
            ruleConsole: { type: 'console' },
            ruleFile: {
                type: 'dateFile',
                filename: conf.log,
                pattern: '-yyyy-MM-dd.log',
                maxLogSize: 100 * 1024 * 1024,
                numBackups: 30,
                alwaysIncludePattern: true
            }
        },
        categories: {
            default: { appenders: ['ruleConsole', 'ruleFile'], level: conf.level }
        },
    });
    Log.info("crawler is starting...");
    let crawler = new crawler_1.Crawler();
    crawler.run(conf);
    function closeall() {
        return __awaiter(this, void 0, void 0, function* () {
            yield crawler.close();
        });
    }
    process.stdin.resume();
    process.on('SIGINT', closeall);
    process.on('SIGTERM', closeall);
}))();
//# sourceMappingURL=main.js.map