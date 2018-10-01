import { readFileSync } from "fs";
import * as log4js from "log4js";
import { Crawler } from "crawler";


let confPath = __dirname + "/conf/crawler.json"
if (process.argv.length > 2) {
    confPath = process.argv[2];
}
let conf = JSON.parse(readFileSync(confPath).toString("utf-8"));

const Log = log4js.getLogger("main");

(async () => {
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
        // replaceConsole:true
    });
    Log.info("crawler is starting...");
    let crawler = new Crawler();
    await crawler.run(conf);
    async function closeall() {
        await crawler.close()
    }
    process.stdin.resume();
    process.on('SIGINT', closeall);
    process.on('SIGTERM', closeall);
})();