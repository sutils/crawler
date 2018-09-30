import * as puppeteer from 'puppeteer';
import * as express from 'express';
import * as compression from 'compression';
import * as http from 'http';
import * as log4js from "log4js";
import { readFileSync } from "fs";
import { Runner, NativeBrowserContextCreator, BrowserContextCreator } from './runner';
import * as SimpleList from "./runner/SimpleList";
import * as path from "path";


const Log = log4js.getLogger("crawler")
//
//load conf
let confPath = __dirname + "/conf/crawler.json"
if (process.argv.length > 2) {
    confPath = process.argv[2];
}
let conf = JSON.parse(readFileSync(confPath).toString("utf-8"))
let ipApi = ["http://ip.dyang.org/", "http://www.3322.org/dyndns/getip"];

async function doGet(uri: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let req = http.get(uri);
        req.on('response', res => {
            let rawData = '';
            res.on('data', (chunk: string) => { rawData += chunk; });
            res.on('end', () => {
                resolve(rawData);
            });
        });
        req.on('error', err => {
            resolve("");
        });
    });
}

async function doGetIP() {
    for (var i = 0; i < ipApi.length; i++) {
        let ip = await doGet(ipApi[i]);
        if (ip == "") {
            continue;
        } else {
            return ip.trim();
        }
    }
    return "";
}

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
    // var ip = await doGetIP();
    // console.log("crawler public ip is " + ip);
    let proxy = conf.proxy ? conf.proxy : "";
    const nativeBrowser = await puppeteer.launch({
        args: ["--blink-settings=imagesEnabled=false", "--proxy-server=" + proxy]
    });
    const browser = new NativeBrowserContextCreator(nativeBrowser);
    let userAgent = await nativeBrowser.userAgent();
    let version = await nativeBrowser.version();
    Log.info("crawler is using chrome:" + version + ", agent:" + userAgent);
    //
    //load runner
    const runners: any = {};
    for (let i = 0; i < conf.runners.length; i++) {
        let runnerPath = conf.runners[i];
        Log.info("crawler load runner by " + runnerPath);
        const runner = require(runnerPath);
        runners[runner.Key] = runner;
    }
    runners[SimpleList.Key] = SimpleList;

    //
    //process task
    async function createTask(options: any, browser: BrowserContextCreator): Promise<any> {
        try {
            Log.info("process task by %s", JSON.stringify(options));
            let runner = runners[options.type];
            if (!runner) {
                Log.warn("process task by %s fail with runner is not exist by %s", JSON.stringify(options), options.type);
                return;
            }
            await (new runner[options.type + "Runner"](options) as Runner).process(browser);
        } catch (e) {
            Log.trace("process task by %s fail with", JSON.stringify(options), e)
        }
    }
    const tasks: Promise<any>[] = [];
    for (let i = 0; i < conf.tasks.length; i++) {
        tasks.push(createTask(conf.tasks[i], browser));
    }
    //
    //web server
    const app = express();
    app.use(compression());
    //
    app.get('/status', async (req, res) => {
        let status = {};
        res.send(JSON.stringify(status));
    });
    let server = app.listen(conf.listen);
    server.on("listening", () => {
        Log.info("crawler is listening on " + conf.listen);
    });
    async function closeall() {
        Log.info("crawler is stopping...");
        await nativeBrowser.close();
        Promise.all(tasks);
        Log.info("crawler is stopped");
        process.exit(1);
    }
    process.stdin.resume();
    process.on('SIGINT', closeall);
    process.on('SIGTERM', closeall);
})();